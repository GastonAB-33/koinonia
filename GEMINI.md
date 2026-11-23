# Reglas del Proyecto (Koinonía)

## Servidor de Desarrollo (Local & Network)
- **Siempre que el usuario pida abrir o iniciar el servidor**, debe ejecutarse expuesto tanto en **Local** (`localhost`) como en **Network** (red local, escuchando en `0.0.0.0` con el flag `--host`).
- Esto es obligatorio para permitir pruebas directas desde el teléfono celular o cualquier dispositivo en la misma red Wi-Fi.
- El comando debe ser `npm run dev -- --host` (y la configuración de `vite.config.ts` mantiene `server.host: true` por defecto).
