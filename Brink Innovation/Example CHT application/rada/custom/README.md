# Custom Modules Built On Medic Mobile's Core

This project was generated using [Nx](https://nx.dev). Nx will aid in making collavoration for the rada custom modules easier via the monorepos pattern. This Project hosts the web-based surveilance tool and custom apis for integrating cht-core with USSD from africa's talking, google maps services, ibm watson and public health dashboards.

🔎 **Nx is a set of Extensible Dev Tools for Monorepos.**

## Quick Start & Documentation

[Nx Documentation](https://nx.dev/angular)

## Adding capabilities to your workspace

Nx supports many plugins which add capabilities for developing different types of applications and different tools.

These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Below are plugins added to your workspace:

- [Angular](https://angular.io)
  - `ng add @nrwl/angular`
- [Nest](https://nestjs.com)
  - `ng add @nrwl/nest`
- [Node](https://nodejs.org)
  - `ng add @nrwl/node`

## Generate an application
Angular is highly modular and allows for dependency injection. This repo accomodates building shareable modules that contribute to the main application. To generate a module/app, allowing to have multiple apps in the same workspace.

Run `ng g @nrwl/angular:app my-app`.

## Generate a library

Run `ng g @nrwl/angular:lib my-lib` to generate a library.

Libraries are sharable across libraries and applications. They can be imported from `@custom/mylib`.

## Development server

Run `ng serve my-app` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng g component my-component --project=my-app` to generate a new component.

## Build

Run `ng build my-app` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test my-app` to execute the unit tests via [Jest](https://jestjs.io).

Run `nx affected:test` to execute the unit tests affected by a change.

## Running end-to-end tests

Run `ng e2e my-app` to execute the end-to-end tests via [Cypress](https://www.cypress.io).

Run `nx affected:e2e` to execute the end-to-end tests affected by a change.

## Understand your workspace

Run `nx dep-graph` to see a diagram of the dependencies of your projects.