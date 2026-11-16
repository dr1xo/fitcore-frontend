# Fitcore (Frontend)

## Componentes compartidos

Los componentes reutilizables están en `src/components/ui` y se importan desde un único lugar:

```tsx
import { Button, DataTable, FormField, SearchInput } from '../components/ui'
```

Sirven de base para los listados y formularios de todas las entidades. Los colores salen de las variables CSS de `src/index.css`, así que cambian junto con el resto de la aplicación.

| Componente    | Para qué sirve                                                           |
| ------------- | ------------------------------------------------------------------------ |
| `DataTable`   | Tabla con paginado y selector de cantidad de registros por página        |
| `SearchInput` | Buscador de texto                                                        |
| `FormField`   | Campo de texto con etiqueta y mensaje de error                           |
| `SelectField` | Lista desplegable con etiqueta y mensaje de error                        |
| `Button`      | Botón con variantes (`primary`, `secondary`, `danger`) y estado de carga |
| `FormMessage` | Mensaje de carga, éxito o error de un formulario                         |
| `Alert`       | Mensaje suelto de error, éxito o información                             |
| `Spinner`     | Indicador de carga                                                       |
| `Pagination`  | Botones Anterior / Siguiente (lo usa `DataTable`)                        |

### Tabla paginada: `DataTable`

La tabla recibe la lista completa y se encarga sola del paginado y del selector de registros por página (5, 10, 20 o 50).

| Prop              | Tipo                           | Obligatoria | Descripción                                                     |
| ----------------- | ------------------------------ | ----------- | --------------------------------------------------------------- |
| `columns`         | `Column<T>[]`                  | Sí          | Columnas: `key`, `header` y, opcionalmente, `render`            |
| `data`            | `T[]`                          | Sí          | Registros a mostrar                                             |
| `getRowKey`       | `(row: T) => string \| number` | Sí          | Devuelve un identificador único por fila (por ejemplo, el `id`) |
| `loading`         | `boolean`                      | No          | Muestra el indicador de carga en lugar de las filas             |
| `error`           | `string`                       | No          | Muestra un mensaje de error en lugar de la tabla                |
| `emptyMessage`    | `string`                       | No          | Texto cuando no hay registros                                   |
| `pageSizeOptions` | `number[]`                     | No          | Opciones del selector. Por defecto `[5, 10, 20, 50]`            |
| `initialPageSize` | `number`                       | No          | Registros por página al abrir. Por defecto, la primera opción   |

Cada columna muestra `row[key]`. Si necesita algo distinto (un botón, una fecha formateada), se usa `render`.

### Ejemplo: listado con buscador

```tsx
import { useMemo, useState } from 'react'
import { Button, DataTable, SearchInput, type Column } from '../components/ui'
import { filterBySearch } from '../utils/search'

interface Profesor {
  id: number
  nombre: string
  email: string
}

const columns: Column<Profesor>[] = [
  { key: 'nombre', header: 'Nombre' },
  { key: 'email', header: 'Email' },
  {
    key: 'acciones',
    header: 'Acciones',
    render: (profesor) => (
      <Button variant="secondary" onClick={() => editar(profesor.id)}>
        Editar
      </Button>
    ),
  },
]

export function ProfesoresPage() {
  const [profesores] = useState<Profesor[]>([]) // los datos vienen de la API
  const [search, setSearch] = useState('')

  const filtrados = useMemo(
    () => filterBySearch(profesores, search, ['nombre', 'email']),
    [profesores, search],
  )

  return (
    <>
      <SearchInput value={search} onChange={setSearch} />
      <DataTable
        columns={columns}
        data={filtrados}
        getRowKey={(profesor) => profesor.id}
      />
    </>
  )
}
```

`filterBySearch` ignora mayúsculas y acentos. Si los datos todavía se están pidiendo, se pasa `loading`; si la petición falla, `error="No se pudieron cargar los profesores"`.

### Formularios: `useForm`

El hook `useForm` maneja los valores, las validaciones, el estado de envío y los mensajes. Los valores del formulario siempre son texto (`string`) y se declaran con `type`, no con `interface`.

```tsx
import { Button, FormField, FormMessage } from '../components/ui'
import { useForm } from '../hooks/useForm'
import { email, minLength, required } from '../utils/validators'

export function ProfesorForm() {
  const form = useForm({
    initialValues: { nombre: '', email: '' },
    rules: {
      nombre: [required(), minLength(3)],
      email: [required(), email()],
    },
    onSubmit: async (values) => {
      await crearProfesor(values) // si lanza un error, se muestra el mensaje
    },
    successMessage: 'Profesor guardado correctamente',
  })

  return (
    <form className="form" onSubmit={form.handleSubmit} noValidate>
      <FormField label="Nombre" required {...form.getFieldProps('nombre')} />
      <FormField
        label="Email"
        type="email"
        required
        {...form.getFieldProps('email')}
      />
      <FormMessage status={form.status} message={form.message} />
      <div className="form-actions">
        <Button type="submit" loading={form.submitting}>
          Guardar
        </Button>
      </div>
    </form>
  )
}
```

- Los errores aparecen al salir de un campo y al enviar. Si hay errores, `onSubmit` no se ejecuta.
- `form.status` puede ser `idle`, `submitting`, `success` o `error`.
- `form.reset()` limpia el formulario. Para cargar datos al editar, `form.reset(valoresDeLaEntidad)`.
- `<form noValidate>` evita que el navegador muestre sus propios mensajes de validación.
- Para listas desplegables se usa `SelectField` con `options={[{ value, label }]}`.

### Validadores

Están en `src/utils/validators.ts`. Todos aceptan un mensaje propio como último parámetro.

| Validador                 | Valida que...                    |
| ------------------------- | -------------------------------- |
| `required()`              | el campo no esté vacío           |
| `minLength(n)`            | tenga al menos `n` caracteres    |
| `maxLength(n)`            | tenga como máximo `n` caracteres |
| `email()`                 | tenga formato de email           |
| `positiveNumber()`        | sea un número mayor a 0          |
| `pattern(regex, mensaje)` | cumpla una expresión regular     |

Salvo `required`, ignoran los campos vacíos: para un campo obligatorio se combinan, por ejemplo `[required(), email()]`. Para una regla nueva alcanza con una función `(valor) => mensaje | undefined`.

### Mensajes

```tsx
<Alert type="error">No se pudo cargar la lista</Alert>
<Alert type="success">Cambios guardados</Alert>
<Button loading>Guardando</Button>
<Spinner label="Cargando clases..." />
```

## Variables de entorno

| Variable       | Para qué sirve                              | Ejemplo                              |
| -------------- | ------------------------------------------- | ------------------------------------ |
| `VITE_API_URL` | URL base de la API del back (con `/api/v1`) | `https://mi-api.onrender.com/api/v1` |

- En desarrollo, copiá `.env.example` como `.env`. Por defecto apunta a `http://localhost:3000/api/v1`.
- El archivo `.env` no se sube al repositorio.
- Vite incorpora la variable al **construir** el proyecto. Si se cambia en Netlify, hay que volver a desplegar para que tenga efecto.
- La URL se usa desde `src/services/api.ts`, que ofrece `apiGet` y `apiRequest` para hablar con el back.

## Deploy

El front se publica en Netlify con deploy automático: cada cambio que llega a la rama `main` genera una nueva versión del sitio.

La configuración está en `netlify.toml`: comando de construcción (`npm run build`), carpeta publicada (`dist`) y una redirección para que las rutas de la aplicación (por ejemplo `/clases`) funcionen al recargar la página.

### Configurar el sitio en Netlify

1. En Netlify: **Add new site → Import an existing project**, elegir GitHub y este repositorio.
2. Rama de producción: `main`.
3. En **Environment variables**, agregar `VITE_API_URL` con la URL del back desplegado, terminada en `/api/v1` y sin barra final.
4. Desplegar. Netlify asigna una URL del estilo `https://nombre-del-sitio.netlify.app`.

### CORS

El back solo acepta pedidos del origen configurado en su variable `CORS_ORIGIN`. En el servicio donde está desplegado el back, `CORS_ORIGIN` tiene que ser **exactamente** la URL del front:

- con `https://`
- sin barra final (`https://nombre-del-sitio.netlify.app`, no `https://nombre-del-sitio.netlify.app/`)
- sin ruta

Después de cambiarla, reiniciar el back.

### Comprobar que el front y el back se conectan

En el pie de la página aparece el estado de la conexión con el servidor:

| Mensaje                        | Significado                                          |
| ------------------------------ | ---------------------------------------------------- |
| `Servidor conectado`           | El front llegó a la API (`/api/v1/health`) sin error |
| `Sin conexión con el servidor` | Hay un problema de URL, de CORS o el back está caído |

Si aparece `Sin conexión con el servidor`, revisar en este orden:

1. Que `VITE_API_URL` esté bien escrita y se haya vuelto a desplegar el front después de cambiarla.
2. Que abrir `<VITE_API_URL>/health` en el navegador muestre `{"status":"ok", ...}`.
3. Que `CORS_ORIGIN` del back sea exactamente la URL del front.
4. En el navegador, abrir las herramientas de desarrollo (F12) y mirar la pestaña **Console**: un error `blocked by CORS policy` confirma que el problema es el paso 3.
