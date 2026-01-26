import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const NOTES_FILE = path.join(process.cwd(), 'AGENTATION_NOTES.md')

/**
 * Parse the markdown file into an array of annotations
 */
function parseNotesFile() {
  if (!fs.existsSync(NOTES_FILE)) {
    return []
  }

  const content = fs.readFileSync(NOTES_FILE, 'utf-8')
  const annotations = []

  // Split by annotation headers
  const sections = content.split(/^## Annotation: /m).filter(Boolean)

  for (const section of sections) {
    // Skip the header section
    if (section.startsWith('# Agentation Notes')) continue

    const lines = section.trim().split('\n')
    const id = lines[0]?.trim()

    if (!id) continue

    const annotation = { id }

    for (const line of lines.slice(1)) {
      if (line.startsWith('**Element:**')) {
        annotation.element = line.replace('**Element:**', '').trim()
      } else if (line.startsWith('**Selector:**')) {
        annotation.selector = line.replace('**Selector:**', '').replace(/`/g, '').trim()
      } else if (line.startsWith('**Path:**')) {
        annotation.elementPath = line.replace('**Path:**', '').replace(/`/g, '').trim()
      } else if (line.startsWith('**Note:**')) {
        annotation.comment = line.replace('**Note:**', '').trim()
      } else if (line.startsWith('**Position:**')) {
        annotation.position = line.replace('**Position:**', '').trim()
      } else if (line.startsWith('**Selected Text:**')) {
        annotation.selectedText = line.replace('**Selected Text:**', '').replace(/^"/, '').replace(/"$/, '').trim()
      }
    }

    if (annotation.id) {
      annotations.push(annotation)
    }
  }

  return annotations
}

/**
 * Convert an annotation object to markdown section
 */
function annotationToMarkdown(annotation) {
  let md = `## Annotation: ${annotation.id}\n`

  if (annotation.element) {
    md += `**Element:** ${annotation.element}\n`
  }

  if (annotation.selector || annotation.cssClasses) {
    let selector = annotation.selector
    if (!selector && annotation.cssClasses) {
      // cssClasses might be a string or array
      const classes = Array.isArray(annotation.cssClasses)
        ? annotation.cssClasses
        : String(annotation.cssClasses).split(' ').filter(Boolean)
      selector = `.${classes.join('.')}`
    }
    if (selector) {
      md += `**Selector:** \`${selector}\`\n`
    }
  }

  if (annotation.elementPath) {
    md += `**Path:** \`${annotation.elementPath}\`\n`
  }

  if (annotation.selectedText) {
    md += `**Selected Text:** "${annotation.selectedText}"\n`
  }

  if (annotation.x !== undefined && annotation.y !== undefined) {
    md += `**Position:** x=${Math.round(annotation.x)}, y=${Math.round(annotation.y)}\n`
  }

  if (annotation.comment) {
    md += `**Note:** ${annotation.comment}\n`
  }

  md += '\n---\n\n'
  return md
}

/**
 * Write annotations array to the markdown file
 */
function writeNotesFile(annotations) {
  if (annotations.length === 0) {
    // Delete file if no annotations
    if (fs.existsSync(NOTES_FILE)) {
      fs.unlinkSync(NOTES_FILE)
    }
    return
  }

  let content = '# Agentation Notes\n\n'
  content += `> UI feedback captured at ${new Date().toLocaleString()}\n`
  content += '> Run `/process-agentation` in Claude Code to process these notes.\n\n'
  content += '---\n\n'

  for (const annotation of annotations) {
    content += annotationToMarkdown(annotation)
  }

  fs.writeFileSync(NOTES_FILE, content, 'utf-8')
}

/**
 * POST - Add or update an annotation
 */
export async function POST(request) {
  try {
    const { action, annotation } = await request.json()

    if (!annotation || !annotation.id) {
      return NextResponse.json({ error: 'Annotation with ID required' }, { status: 400 })
    }

    const annotations = parseNotesFile()

    if (action === 'add') {
      // Check if already exists
      const existingIndex = annotations.findIndex((a) => a.id === annotation.id)
      if (existingIndex >= 0) {
        annotations[existingIndex] = annotation
      } else {
        annotations.push(annotation)
      }
    } else if (action === 'update') {
      const existingIndex = annotations.findIndex((a) => a.id === annotation.id)
      if (existingIndex >= 0) {
        annotations[existingIndex] = { ...annotations[existingIndex], ...annotation }
      } else {
        // If not found, add it
        annotations.push(annotation)
      }
    } else {
      return NextResponse.json({ error: 'Invalid action. Use "add" or "update"' }, { status: 400 })
    }

    writeNotesFile(annotations)

    return NextResponse.json({
      success: true,
      message: `Annotation ${action === 'add' ? 'added' : 'updated'}`,
      count: annotations.length,
    })
  } catch (error) {
    console.error('Agentation API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE - Remove annotation by ID or clear all
 */
export async function DELETE(request) {
  try {
    const { action, id } = await request.json()

    if (action === 'clear') {
      // Clear the entire file
      if (fs.existsSync(NOTES_FILE)) {
        fs.unlinkSync(NOTES_FILE)
      }
      return NextResponse.json({ success: true, message: 'All annotations cleared' })
    }

    if (action === 'delete') {
      if (!id) {
        return NextResponse.json({ error: 'Annotation ID required for delete' }, { status: 400 })
      }

      const annotations = parseNotesFile()
      const filtered = annotations.filter((a) => a.id !== id)

      writeNotesFile(filtered)

      return NextResponse.json({
        success: true,
        message: 'Annotation deleted',
        count: filtered.length,
      })
    }

    return NextResponse.json({ error: 'Invalid action. Use "delete" or "clear"' }, { status: 400 })
  } catch (error) {
    console.error('Agentation API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * GET - Read current annotations
 */
export async function GET() {
  try {
    const annotations = parseNotesFile()
    const exists = fs.existsSync(NOTES_FILE)

    return NextResponse.json({
      exists,
      count: annotations.length,
      annotations,
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
