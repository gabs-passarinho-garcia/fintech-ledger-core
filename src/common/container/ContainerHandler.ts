import {
  asClass,
  asFunction,
  asValue,
  createContainer,
  type AwilixContainer,
  type Resolver,
} from 'awilix';
import type { IAppContainer, AppProviderName } from '../interfaces/IAppContainer';
import { Logger } from '../providers/Logger';
import { InternalError } from '@/common/errors';

/**
 * Type alias for Awilix provider registrations.
 */
export type ProviderRegistration = Resolver<unknown>;

/**
 * Defines a module structure for container registration.
 */
export interface ModuleDefinition {
  name: string;
  providers?: Partial<Record<AppProviderName, Resolver<IAppContainer[AppProviderName]>>>;
  imports?: ModuleDefinition[];
}

const LOG_TYPE_CONTAINER = 'container';

/**
 * Container lifecycle management constants.
 */
export const Lifecycle = {
  SINGLETON: 'SINGLETON',
  SCOPED: 'SCOPED',
  TRANSIENT: 'TRANSIENT',
} as const;

export type Lifecycle = (typeof Lifecycle)[keyof typeof Lifecycle];

/**
 * Type for dependency-injectable constructors.
 * This allows classes to receive only the dependencies they actually need through type-safe injection.
 *
 * @template T The type being constructed
 */
export type InjectableClassCtor<T> = new (
  deps: Record<AppProviderName, IAppContainer[T extends string ? AppProviderName : never]>,
) => T;

/**
 * Creates a class-based provider resolver with the specified lifecycle.
 */
export function provideClass<T, Ctor extends InjectableClassCtor<T>>(
  ctor: Ctor,
  lifecycle: Lifecycle,
): Resolver<T> {
  Logger.logStatic(
    'debug',
    { ctor: (ctor as unknown as { name?: string }).name, lifecycle },
    'provideClass',
    'ContainerHandler',
  );
  switch (lifecycle) {
    case Lifecycle.SINGLETON:
      return asClass<T>(ctor as never).singleton();
    case Lifecycle.SCOPED:
      return asClass<T>(ctor as never).scoped();
    case Lifecycle.TRANSIENT:
      return asClass<T>(ctor as never).transient();
    default:
      return asClass<T>(ctor as never).scoped();
  }
}

/**
 * Creates a factory-based provider resolver with the specified lifecycle.
 */
export function provideFactory<T, D extends object, F extends (deps: D) => T>(
  factory: F,
  lifecycle: Lifecycle,
): Resolver<T> {
  Logger.logStatic('debug', { lifecycle }, 'provideFactory', 'ContainerHandler');
  switch (lifecycle) {
    case Lifecycle.SINGLETON:
      return asFunction<T>(factory).singleton();
    case Lifecycle.SCOPED:
      return asFunction<T>(factory).scoped();
    case Lifecycle.TRANSIENT:
      return asFunction<T>(factory).transient();
    default:
      return asFunction<T>(factory).scoped();
  }
}

/**
 * Creates a value-based provider resolver.
 */
export function provideValue<T>(value: T): Resolver<T> {
  return asValue<T>(value);
}

declare global {
  var ledgerCoreContainer: AwilixContainer<IAppContainer>;
}

/**
 * Central handler for dependency injection container management.
 */
export class ContainerHandler {
  private static container: AwilixContainer<IAppContainer>;
  private readonly scope: AwilixContainer<IAppContainer>;

  private constructor(scope: AwilixContainer<IAppContainer>) {
    this.scope = scope;
  }

  /**
   * Initializes the root container.
   */
  public static init(): void {
    const container = ContainerHandler.retrieve();
    if (!container) {
      ContainerHandler.container = createContainer<IAppContainer>();
      globalThis.ledgerCoreContainer = ContainerHandler.container;
      Logger.logStatic(
        'info',
        'Root container initialized',
        LOG_TYPE_CONTAINER,
        ContainerHandler.name,
      );
    } else {
      ContainerHandler.container = container;
      globalThis.ledgerCoreContainer = container;
      Logger.logStatic(
        'info',
        'Root container initialized from global',
        LOG_TYPE_CONTAINER,
        ContainerHandler.name,
      );
    }
  }

  /**
   * Creates a new scoped container handler.
   */
  public static createScope(): ContainerHandler {
    const scoped = ContainerHandler.get().createScope();
    Logger.logStatic('info', 'Scope created', LOG_TYPE_CONTAINER, ContainerHandler.name);
    return new ContainerHandler(scoped);
  }

  /**
   * Registers a module and its dependencies in the container.
   */
  public static registerModule(module: ModuleDefinition): void {
    const container = ContainerHandler.get();
    Logger.logStatic(
      'info',
      { module: module.name },
      'registerModule:start',
      ContainerHandler.name,
    );

    const visited = new Set<string>();
    const stack: ModuleDefinition[] = [module];

    // Iterative depth-first search for module registration
    // Using while loop is necessary here for iterative DFS algorithm
    // eslint-disable-next-line no-restricted-syntax
    while (stack.length > 0) {
      const mod = stack.pop() as ModuleDefinition;
      if (visited.has(mod.name)) continue;
      visited.add(mod.name);

      if (mod.imports && mod.imports.length > 0) {
        mod.imports.forEach((child) => {
          if (!visited.has(child.name)) stack.push(child);
        });
      }

      if (mod.providers) {
        (
          Object.entries(mod.providers) as Array<
            [AppProviderName, Resolver<IAppContainer[AppProviderName]>]
          >
        ).forEach(([key, registration]) => {
          container.register(key, registration);
        });
      }
    }

    Logger.logStatic('info', { module: module.name }, 'registerModule:done', ContainerHandler.name);
  }

  /**
   * Retrieves the root container instance.
   */
  public static retrieve(): AwilixContainer<IAppContainer> | null {
    if (ContainerHandler.container) {
      return ContainerHandler.container;
    }
    if (globalThis.ledgerCoreContainer) {
      return globalThis.ledgerCoreContainer;
    }
    return null;
  }

  /**
   * Gets the root container instance, throwing an error if not initialized.
   */
  public static get(): AwilixContainer<IAppContainer> {
    const container = ContainerHandler.retrieve();
    if (!container) {
      throw new InternalError({
        additionalMessage: 'Container not initialized. Call ContainerHandler.init() first.',
      });
    }
    ContainerHandler.container = container;
    globalThis.ledgerCoreContainer = container;
    return container;
  }

  /**
   * Resolves a dependency from the root container.
   */
  public static resolve<T extends AppProviderName>(name: T): IAppContainer[T] {
    return ContainerHandler.get().resolve<IAppContainer[T]>(name);
  }

  /**
   * Resolves a dependency from the scoped container.
   */
  public resolve<T extends AppProviderName>(name: T): IAppContainer[T] {
    return this.scope.resolve<IAppContainer[T]>(name);
  }
}
