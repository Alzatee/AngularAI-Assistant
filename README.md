URL PROYECTO DEMO, CON EJEMPLO DE DISTINTAS EMPRESAS/AREAS:
Proyecto Freelance adecuado para mostrar en GIT.
(La url recibe el parámetro que le indica qué empresa/area está accediendo)
- https://alzatee.github.io/AngularAI-Assistant/#/virtual-assistand?area=cHJ1ZWJhLWNvZGlnbw==
- https://alzatee.github.io/AngularAI-Assistant/#/virtual-assistand?area=cHJ1ZWJhLWNvZGlnby11bm8=
- https://alzatee.github.io/AngularAI-Assistant/#/virtual-assistand?area=cHJ1ZWJhLWNvZGlnby1kb3M=

DESCRIPCIÓN BREVE: Proyecto Freelance para generar un chat o asistente virtual con IA.
Notas: 
- Algunos de los servicios fueron remplazados para poder mostrarlo en GIT por lo cual algunas funcionalidades no se puedes observar en este DEMO.

Mock empresas/areas:
https://mocki.io/v1/f61a9755-4665-405f-8f53-83176749e2e6

# AsistenteVirtual.Angular
Documentación [Doumentación de Agular](https://angular.io/docs)


## Ejecutar información sobre las versiones Angular:
````sh
$ ng version
````


## Instalación:
**Para compilar el proyecto se necesita tener en cuenta lo siguiente:**

1. Instalar NodeJs última versión, en su versión TLS [NodeJS Descarga](https://angular.io/docs) - v18.20.4
2. Instalar Angular CLI en una termina nodejs o cmd [Angular CLI](https://github.com/angular/angular-cli) version 18.1.2
````sh
$ npm install -g @angular/cli
````
3. Instalar Visual Estudio Code [VSCode Descarga](https://code.visualstudio.com/)
4. Descargar la carpeta del proyecto y abrirlo en Visual Studio code
5. Ejecutar el siguiente comando para instalar las dependencias del package (Se creará una carpera "node_modules")
````sh
$ npm install
````


## Compilación:
1. Ejecutar el siguiente comando para compilar el proyecto:
````sh
$ ng serve
````

## Compilación Mocks:
1. Ejecutar el siguiente comando para compilar mocks en el proyecto desde /public/mock-json:
````sh
$ npm run mock:server
````

2. Abrir en el navegador el puerto `http://localhost:4200/`
También puede saltar este paso y ejecutar el siguiente comando para que se abra el navegador automáticamente:
````sh
$ ng serve --open
````
	***El comando `ng serve` básico ejecutará por defecto el ambiente de desarrolo (environment.developmen.ts); puede compilar otros ambientes con los comandos a continuación***
### Ambientes locales (Comandos Compilación):
| AMBIENTE | COMANDO |
| ------ | ----- | ----- | ------ | ----- | ----- | ------ |
| DESARROLLO     | `ng serve --configuration development`  |
| PRUEBAS        | `ng serve --configuration qa`           |
| PRODUCCIÓN     | `ng serve --configuration production`   |


## Transpilación (Build):
1. Ejecutar el siguiente comando para transpilar(Realizar el build) el proyecto:
````sh
$ ng build
````
	***El comando `ng build` básico ejecutará por defecto el Build para el ambiente de Producción (environment.production.ts); puede realizar el build a otros ambientes con los comandos a continuación***
### Ambientes locales (Comandos Build):
| AMBIENTE | COMANDO |
| ------ | ----- | ----- | ------ | ----- | ----- | ------ |
| DESARROLLO     | `ng build --configuration development`  |
| PRUEBAS        | `ng build --configuration qa`           |
| PRODUCCIÓN     | `ng build --configuration production`   |


## Alias
**Se crearon unos Alias/Paths en el archivo tsconfig.json**
Estos Alias nos permiten acceder en las importaciones a carpetas de interés mucho más directo, fácil y mantenible, Ejemplo:
"@environments/*": ["environments/*"],
"@core/*": ["app/app-core/*"],
"@components/*": ["app/components/*"],
"@layout/*": ["app/layout/*"],
"@services/*": ["app/services/*"]

`import { environment } from '@environments/environment';`
`import { ... } from '@core/...';`

## Dependencias: Licencia MIT (Libre).
- Sass (Sintaxis SCSS: **Se usa la misma sintaxis que el css normal**)
[Sass](https://sass-lang.com/documentation)
[Bootstrap 5](https://getbootstrap.com/docs/5.0/getting-started/introduction/)
[Angular Material](https://material.angular.io/)

[google/generative-ai](https://aistudio.google.com/)(https://ai.google.dev/gemini-api/docs?_gl=1*jdw8o9*_ga*MTkxNjc4Nzg5Ni4xNzI0MTE2Njk2*_ga_P1DBVKWT6V*MTcyNDExNjY5NS4xLjEuMTcyNDExOTMwNC40Ny4wLjE2Njg2NzYyMzA.&hl=es-419)

[ngx-file-drop](https://www.npmjs.com/package/ngx-file-drop)
[showdown](https://www.npmjs.com/package/showdown)and(https://www.npmjs.com/package/@types/showdown)

## Recursos y utilidades
**Las variables [environtmens] están almacenadas de Azure**# AngularAI-Assistant
