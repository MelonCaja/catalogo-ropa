import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware raíz. DEBE vivir en `src/` (junto a `app/`) para que Next lo cargue
 * cuando el proyecto usa el directorio `src/`. Delega en `updateSession`, que
 * refresca la sesión y protege `/admin` antes de renderizar nada.
 */
export function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Corre en todas las rutas EXCEPTO:
     *  - _next/static, _next/image  (bundles y optimización de imágenes)
     *  - favicon.ico
     *  - archivos con extensión de imagen en /public
     * Se mantiene activo en "/" y en "/login" para refrescar/consultar la sesión.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
