# Política de Privacidad de Tinball — borrador operativo

> Borrador técnico sujeto a revisión legal antes de publicarse. Reemplazar todos los campos `[COMPLETAR]`, definir plazos por jurisdicción y publicar una versión fechada y accesible sin iniciar sesión.

Última actualización prevista: `[COMPLETAR]`.

## Responsable y contacto

Tinball, operado por `[RAZÓN SOCIAL, CUIT Y DOMICILIO]`, es responsable del tratamiento. Consultas y ejercicio de derechos: `[EMAIL DE PRIVACIDAD]`. Soporte y denuncias: `[URL/EMAIL DE SOPORTE]`.

## Datos tratados

- Cuenta Google: identificador, email verificado, nombre y foto que Google entrega con consentimiento.
- Perfil deportivo: fecha de nacimiento, localidad/provincia, posiciones, nivel, pie preferido, biografía y disponibilidad futura cuando se implemente.
- Actividad: equipos, lobbies, partidos, check-in, resultados, formaciones, torneos, rankings, puntos, canjes y referidos.
- Comunidad: mensajes, publicaciones, reacciones, comentarios, reseñas, bloqueos, reportes y apelaciones.
- Seguridad: sesiones, dispositivo, fechas de acceso y versiones HMAC de IP/user-agent. Tinball no necesita conservar coordenadas precisas para el check-in.
- Transacciones futuras: reservas, suscripciones o premios sólo cuando la función esté habilitada y con información adicional específica.

## Finalidades y bases

Los datos se usan para prestar el servicio solicitado; verificar identidad, asistencia y resultados; recomendar jugadores y lobbies; mantener rankings y recompensas; prevenir fraude y abuso; moderar la comunidad; responder soporte; cumplir obligaciones legales; y enviar notificaciones configurables. Consentimiento, ejecución del servicio, interés legítimo y obligación legal deberán mapearse definitivamente según cada jurisdicción.

## Visibilidad

Otros usuarios pueden ver el nombre, foto, localidad aproximada, perfil deportivo, confiabilidad, ranking y reseñas publicadas. El email, la fecha de nacimiento exacta, los bloqueos, los reportes, la evidencia y los datos de seguridad no son públicos. Bloquear a alguien evita descubrimiento, invitaciones y contenido de feed entre ambas cuentas; no elimina registros requeridos para investigar una denuncia.

## Proveedores y transferencias

El servicio proyecta usar Google (identidad), Render (API), Neon (PostgreSQL), Upstash (límites distribuidos), Expo/EAS (builds y actualizaciones) y proveedores aprobados de monitoreo, notificaciones u objetos. Antes del lanzamiento se debe publicar la lista efectiva, ubicación, finalidad, contratos y mecanismos de transferencia internacional.

## Conservación

Las sesiones vencidas, claves de idempotencia y datos efímeros se depuran automáticamente. Contenido eliminado se anonimiza o marca como eliminado. Auditoría, resultados, sanciones, ledgers y registros antifraude pueden conservarse por los plazos legales y de defensa aplicables. Debe aprobarse una matriz de retención concreta antes de producción.

## Derechos

Desde Configuración se puede descargar una copia JSON y eliminar la cuenta con reautenticación de Google. La eliminación revoca sesiones, elimina perfil e identidad, cancela actividad futura y seudonimiza el mínimo histórico necesario. También pueden solicitarse acceso, rectificación, oposición o revisión de decisiones en `[CANAL]`. Una suspensión no elimina estos derechos.

## Edad, seguridad y cambios

Tinball exige al menos 16 años en el MVP; cualquier función monetaria requerirá controles adicionales y posiblemente 18+. Se aplican cifrado en tránsito, sesiones opacas, controles de acceso, rate limiting y auditoría, sin prometer seguridad absoluta. Los cambios sustanciales se informarán antes de entrar en vigencia y conservarán historial de versiones.
