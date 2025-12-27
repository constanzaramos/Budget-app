# Budget App - Control de Gastos

Una aplicación web moderna para el control de gastos personales con vista mensual, gráficas, categorías y presupuesto.

## Características

- 📊 **Vista Mensual**: Navega entre meses para ver tus gastos organizados por período
- 📈 **Gráficas Interactivas**: 
  - Gráfica de barras mostrando gastos por categoría
  - Gráfica de pastel con la distribución de gastos
- 🏷️ **Sistema de Categorías**: 
  - Categorías predefinidas (Alimentación, Transporte, Entretenimiento, etc.)
  - Crea tus propias categorías personalizadas con iconos y colores
- 💰 **Presupuesto Mensual**: 
  - Establece un presupuesto mensual
  - Visualiza el gasto total, porcentaje utilizado y saldo restante
- 💾 **Persistencia Local**: Todos tus datos se guardan en el navegador (localStorage)
- 📱 **Diseño Responsive**: Funciona perfectamente en dispositivos móviles y escritorio

## Tecnologías

- React 18
- Vite
- Recharts (gráficas)
- Lucide React (iconos)
- date-fns (manejo de fechas)

## Instalación

1. Navega a la carpeta del proyecto:
```bash
cd "budget app"
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

4. Abre tu navegador en la URL que aparece en la terminal (generalmente `http://localhost:5173`)

## Uso

1. **Establecer Presupuesto**: Haz clic en "Establecer presupuesto" o "Editar" en la tarjeta de presupuesto para definir tu presupuesto mensual.

2. **Agregar Gastos**: 
   - Completa el formulario de "Agregar Gasto"
   - Ingresa la cantidad, descripción, categoría y fecha
   - Haz clic en "Agregar Gasto"

3. **Crear Categorías**: 
   - Haz clic en el botón "+" junto al selector de categorías
   - Elige un nombre, icono y color
   - Guarda tu nueva categoría

4. **Navegar entre Meses**: Usa las flechas en el header para cambiar de mes y ver los gastos de diferentes períodos.

5. **Visualizar Estadísticas**: 
   - Las tarjetas superiores muestran tu presupuesto, gastos totales y saldo restante
   - Las gráficas muestran la distribución de tus gastos por categoría

6. **Eliminar Gastos**: Haz clic en el icono de basura junto a cualquier gasto para eliminarlo.

## Estructura del Proyecto

```
budget app/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Encabezado con navegación de meses
│   │   ├── Dashboard.jsx       # Panel principal con estadísticas y gráficas
│   │   ├── BudgetForm.jsx      # Formulario para establecer presupuesto
│   │   ├── ExpenseForm.jsx     # Formulario para agregar gastos
│   │   └── ExpenseList.jsx     # Lista de gastos del mes
│   ├── App.jsx                 # Componente principal
│   ├── App.css                 # Estilos de la aplicación
│   ├── index.css               # Estilos globales
│   └── main.jsx                # Punto de entrada
├── index.html
├── package.json
└── README.md
```

## Construir para Producción

Para crear una versión optimizada para producción:

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`.

Para previsualizar la versión de producción:

```bash
npm run preview
```

## Notas

- Todos los datos se guardan localmente en tu navegador (localStorage)
- Los datos persisten entre sesiones
- Para limpiar todos los datos, borra el localStorage del navegador

