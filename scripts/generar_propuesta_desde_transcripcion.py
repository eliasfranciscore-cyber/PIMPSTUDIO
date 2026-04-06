#!/usr/bin/env python3
import argparse
from datetime import date
from pathlib import Path

TEMPLATE = """# Propuesta Comercial\n\n## Fecha\n{fecha}\n\n## Contexto Detectado (desde transcripción)\n{contexto}\n\n## Propuesta de Valor\nCon base en lo conversado, proponemos una solución enfocada en resultados medibles, con ejecución por etapas y seguimiento continuo.\n\n## Alcance Sugerido\n{alcance}\n\n## Cronograma Sugerido\n- Semana 1: Descubrimiento y definición detallada.\n- Semana 2: Implementación del primer bloque.\n- Semana 3: Ajustes, validación y cierre inicial.\n\n## Inversión\n[Completar monto, moneda y condiciones]\n\n## Riesgos y Consideraciones\n- Disponibilidad de información por parte del cliente.\n- Tiempos de aprobación para hitos clave.\n\n## Próximos Pasos\n1. Validar alcance final.\n2. Confirmar fechas y responsables.\n3. Aprobación y arranque.\n"""


def extraer_contexto(texto: str) -> str:
    limpio = " ".join(texto.strip().split())
    if len(limpio) > 1200:
        limpio = limpio[:1200] + "..."
    return limpio if limpio else "[Sin contexto detectado]"


def sugerir_alcance(texto: str) -> str:
    tl = texto.lower()
    items = []
    if any(k in tl for k in ["web", "landing", "sitio"]):
        items.append("- Diseño y contenido de landing page orientada a conversión.")
    if any(k in tl for k in ["automatiz", "flujo", "proceso"]):
        items.append("- Automatización de procesos operativos prioritarios.")
    if any(k in tl for k in ["ventas", "lead", "comercial"]):
        items.append("- Soporte a proceso comercial: seguimiento de leads y pipeline.")
    if any(k in tl for k in ["reporte", "kpi", "indicador"]):
        items.append("- Tablero de seguimiento con KPIs y cadencia semanal.")
    if not items:
        items = [
            "- Diagnóstico inicial del contexto y objetivos.",
            "- Plan de trabajo por etapas con entregables claros.",
            "- Seguimiento semanal y ajustes por resultados.",
        ]
    return "\n".join(items)


def main() -> None:
    parser = argparse.ArgumentParser(description="Genera borrador de propuesta desde una transcripción.")
    parser.add_argument("--input", required=True, help="Ruta del archivo de transcripción")
    parser.add_argument("--output", required=True, help="Ruta de salida .md")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        raise SystemExit(f"No existe el archivo de entrada: {input_path}")

    texto = input_path.read_text(encoding="utf-8")
    md = TEMPLATE.format(
        fecha=date.today().isoformat(),
        contexto=extraer_contexto(texto),
        alcance=sugerir_alcance(texto),
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(md, encoding="utf-8")
    print(f"Borrador generado: {output_path}")


if __name__ == "__main__":
    main()
