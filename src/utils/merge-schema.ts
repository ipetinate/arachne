export function mergeSchema(schema: string): string {
  const typeMap: Record<string, Set<string>> = {}
  const scalarSet = new Set<string>()
  const inputMap: Record<string, Set<string>> = {}
  const enumMap: Record<string, Set<string>> = {}
  const interfaceMap: Record<string, Set<string>> = {}

  const lines = (schema ?? '')
    ?.split('\n')
    ?.map((line) => line.trim())
    ?.filter((line) => line)

  let currentType: string | null = null
  let currentCollection: Record<string, Set<string>> | null = null

  for (const line of lines) {
    if (line.startsWith('type ') && line.includes('{')) {
      const match = line.match(/type\s+(\w+)\s*{/)
      if (match) {
        currentType = match[1].trim()
        currentCollection = typeMap
        if (!currentCollection[currentType]) {
          currentCollection[currentType] = new Set()
        }
      } else {
        currentType = null
        currentCollection = null
      }
    } else if (line.startsWith('scalar ')) {
      const scalarName = line.split(' ')[1].trim()
      scalarSet.add(scalarName)
    } else if (line.startsWith('input ') && line.includes('{')) {
      const match = line.match(/input\s+(\w+)\s*{/)
      if (match) {
        currentType = match[1].trim()
        currentCollection = inputMap
        if (!currentCollection[currentType]) {
          currentCollection[currentType] = new Set()
        }
      } else {
        currentType = null
        currentCollection = null
      }
    } else if (line.startsWith('enum ') && line.includes('{')) {
      const match = line.match(/enum\s+(\w+)\s*{/)
      if (match) {
        currentType = match[1].trim()
        currentCollection = enumMap
        if (!currentCollection[currentType]) {
          currentCollection[currentType] = new Set()
        }
      } else {
        currentType = null
        currentCollection = null
      }
    } else if (line.startsWith('interface ') && line.includes('{')) {
      const match = line.match(/interface\s+(\w+)\s*{/)
      if (match) {
        currentType = match[1].trim()
        currentCollection = interfaceMap
        if (!currentCollection[currentType]) {
          currentCollection[currentType] = new Set()
        }
      } else {
        currentType = null
        currentCollection = null
      }
    } else if (line === '}') {
      currentType = null
      currentCollection = null
    } else if (currentType && currentCollection) {
      const normalizedField = line
        .replace(/\s+/g, '')
        .replace(/:\s*/g, ': ')
        .trim()
      if (normalizedField) {
        currentCollection[currentType].add(normalizedField)
      }
    }
  }

  let mergedSchema = ''

  Object.entries(typeMap).forEach(([type, fields]) => {
    if (fields.size > 0) {
      mergedSchema += `type ${type} {\n`
      Array.from(fields)
        .sort()
        .forEach((field) => {
          mergedSchema += `  ${field}\n`
        })
      mergedSchema += `}\n\n`
    }
  })

  if (scalarSet.size > 0) {
    Array.from(scalarSet)
      .sort()
      .forEach((scalar) => {
        mergedSchema += `scalar ${scalar}\n`
      })
    mergedSchema += `\n`
  }

  Object.entries(inputMap).forEach(([input, fields]) => {
    if (fields.size > 0) {
      mergedSchema += `input ${input} {\n`
      Array.from(fields)
        .sort()
        .forEach((field) => {
          mergedSchema += `  ${field}\n`
        })
      mergedSchema += `}\n\n`
    }
  })

  Object.entries(enumMap).forEach(([enumType, values]) => {
    if (values.size > 0) {
      mergedSchema += `enum ${enumType} {\n`
      Array.from(values)
        .sort()
        .forEach((value) => {
          mergedSchema += `  ${value}\n`
        })
      mergedSchema += `}\n\n`
    }
  })

  Object.entries(interfaceMap).forEach(([interfaceType, fields]) => {
    if (fields.size > 0) {
      mergedSchema += `interface ${interfaceType} {\n`
      Array.from(fields)
        .sort()
        .forEach((field) => {
          mergedSchema += `  ${field}\n`
        })
      mergedSchema += `}\n\n`
    }
  })

  return mergedSchema.trim()
}
