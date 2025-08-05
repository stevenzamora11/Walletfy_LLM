# Walletfy 2

Walletfy 2 es una aplicación web construida con React y TypeScript que te permite llevar un control detallado de tus ingresos y egresos. Organiza tus eventos financieros por mes y año, calcula balances mensuales y globales, y proporciona una experiencia clara, responsiva y accesible con cambio dinámico de tema (claro/oscuro).

## Descripción General

Walletfy 2 permite a los usuarios:
- Definir un balance inicial.
- Registrar eventos de ingreso o egreso.
- Agrupar eventos automáticamente por mes y año.
- Calcular automáticamente el ingreso, egreso, balance mensual y acumulado.
- Editar o eliminar eventos fácilmente.
- Usar tooltips para ver descripciones y fechas.
- Cambiar entre modo claro/oscuro.
- Persistir datos localmente usando Zustand y `localStorage`.

### Estructura del Proyecto

```bash
src/
├── components/
│   ├── Header.tsx            # Encabezado de la página
│   └── EventForm.tsx         # Formulario general
├── routes/
│   ├── __root.tsx  
│   ├── index.tsx             # Página principal
│   ├── event/form.tsx        # Crear nuevo evento
│   └── event/form/$eventId.tsx  # Editar evento
├── stores/
│   └── walletStore.ts        # Estado global con Zustand
├── types/
│   ├── event.ts              # Esquema para cada evento
│   └── month.ts              # Esquema para cada mes con los eventos agrupados
├── utils/
│   ├── months.ts             # Agrupar eventos por mes 
│   └── useTheme.ts           # Cambio del modo claro/oscuro 
├── App.css
├── main.tsx
├── reportWebVitals.ts
├── routeTree.gen.ts
└── styles.css
```

## Ejecución Local

Sigue estos pasos para ejecutar Walletfy en tu entorno local:

```bash
# Clona el repositorio
https://github.com/stevenzamora11/Steven_Walletfy.git

# Entra al directorio
cd Steven_Walletfy

# Instala dependencias
npm install

# Inicia el servidor de desarrollo
npm run dev
```
