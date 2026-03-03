---
name: "@nestjs/core"
description: >
  Progressive Node.js framework for building scalable server-side applications with TypeScript decorators and dependency injection. Use when: enterprise APIs, microservices, structured monoliths, GraphQL servers, WebSocket gateways. NOT for: simple scripts, small prototypes, serverless edge functions.
---

# @nestjs/core

## Overview
NestJS is an opinionated, TypeScript-first framework for building server-side applications. It uses decorators, modules, and dependency injection inspired by Angular, providing a highly structured architecture. NestJS supports REST, GraphQL, WebSockets, and microservices out of the box, and sits on top of Express or Fastify as the underlying HTTP platform.

## Installation
```bash
# Recommended: use the CLI
npm install -g @nestjs/cli
nest new my-project

# Manual installation
npm install @nestjs/core @nestjs/common @nestjs/platform-express reflect-metadata rxjs
```

## Core API / Commands

### Module
```ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [],                    // Other modules to import
  controllers: [UsersController], // Controllers handled by this module
  providers: [UsersService],      // Injectable services
  exports: [UsersService],        // Providers available to importing modules
})
export class UsersModule {}
```

### Controller
```ts
import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query('page') page: number = 1) {
    return this.usersService.findAll(page);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

### Provider (Injectable Service)
```ts
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users = [{ id: '1', name: 'Alice', email: 'alice@example.com' }];

  findAll(page: number) {
    return this.users;
  }

  findOne(id: string) {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  create(dto: CreateUserDto) {
    const user = { id: String(this.users.length + 1), ...dto };
    this.users.push(user);
    return user;
  }

  update(id: string, dto: UpdateUserDto) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) throw new NotFoundException();
    this.users[idx] = { ...this.users[idx], ...dto };
    return this.users[idx];
  }

  remove(id: string) {
    this.users = this.users.filter(u => u.id !== id);
  }
}
```

## Common Patterns

### Validation with class-validator
```ts
// dto/create-user.dto.ts
import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;
}

// main.ts -- enable global validation
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,         // Strip unknown properties
    forbidNonWhitelisted: true,
    transform: true,         // Auto-transform payloads to DTO instances
  }));
  await app.listen(3000);
}
```

### Guards (authentication/authorization)
```ts
import { Injectable, CanActivate, ExecutionContext, UseGuards } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) return false;
    request.user = this.validateToken(token);
    return true;
  }
}

// Apply to a controller or route
@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  @Get('dashboard')
  getDashboard() {
    return { message: 'Admin area' };
  }
}
```

### Interceptors and Pipes
```ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return next.handle().pipe(
      tap(() => console.log(`Response time: ${Date.now() - now}ms`)),
    );
  }
}

// Apply globally in main.ts
app.useGlobalInterceptors(new LoggingInterceptor());
```

### Middleware
```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.url}`);
    next();
  }
}

// Apply in module
@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
```

## Configuration

### CLI commands
```bash
nest new project-name           # Create new project
nest generate module users      # Generate a module
nest generate controller users  # Generate a controller
nest generate service users     # Generate a service
nest generate resource users    # Generate full CRUD resource
nest build                      # Build the project
nest start --watch              # Start in watch mode
```

### Application setup
```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');     // Global route prefix
  app.enableCors({ origin: 'http://localhost:3000' });
  app.enableShutdownHooks();         // Graceful shutdown
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

## Tips & Gotchas
- NestJS requires `"emitDecoratorMetadata": true` and `"experimentalDecorators": true` in `tsconfig.json` -- the CLI sets these up automatically.
- Dependency injection is constructor-based. Always use `private readonly` in constructor parameters for providers.
- The request lifecycle order is: Middleware -> Guards -> Interceptors (before) -> Pipes -> Handler -> Interceptors (after) -> Exception Filters.
- Use `@UseGuards()`, `@UseInterceptors()`, `@UsePipes()` at controller or method level. Use `app.useGlobal*()` for application-wide behavior.
- NestJS throws standard HTTP exceptions (NotFoundException, BadRequestException, etc.) from `@nestjs/common` -- do not throw generic Error objects.
- Every provider must be registered in a module's `providers` array. If a provider is needed in another module, it must also be in `exports`.
- Use `nest generate resource` to scaffold a complete CRUD module with controller, service, DTOs, and module file at once.
- By default NestJS uses Express underneath. Switch to Fastify with `@nestjs/platform-fastify` for better performance.
- Circular dependencies between modules can be resolved using `forwardRef(() => OtherModule)`.
- Testing: NestJS provides `@nestjs/testing` with `Test.createTestingModule()` for unit and integration testing with dependency injection.
