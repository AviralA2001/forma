export const PUBLISH_CONDITIONS = [
  'At least one table',
  'At least one column',
  'At least one user',
  'Valid formulas',
  'Valid routing config',
] as const;

export type PublishCondition = (typeof PUBLISH_CONDITIONS)[number];

type MasterColumn = {
  name?: string;
  type?: string;
  formula?: string;
  source_table_id?: string;
  lookup_table_id?: string;
};

type MasterJoin = {
  base_table_id?: string;
  join_table_id?: string;
};

export function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function referencesName(formula: string, name: string): boolean {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^A-Za-z0-9_])${escaped}([^A-Za-z0-9_]|$)`).test(formula);
}

function formulasAreValid(columns: MasterColumn[]): boolean {
  const formulas = columns.filter((column) => column.type === 'formula');
  if (formulas.some((column) => !column.formula || !String(column.formula).trim() || !column.name)) {
    return false;
  }

  const names = formulas.map((column) => column.name as string);
  const graph = new Map<string, string[]>();
  for (const column of formulas) {
    const name = column.name as string;
    const formula = String(column.formula);
    const refs = names.filter((other) => referencesName(formula, other));
    graph.set(name, refs);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const hasCycle = (node: string): boolean => {
    if (visiting.has(node)) {
      return true;
    }
    if (visited.has(node)) {
      return false;
    }
    visiting.add(node);
    for (const next of graph.get(node) || []) {
      if (hasCycle(next)) {
        return true;
      }
    }
    visiting.delete(node);
    visited.add(node);
    return false;
  };

  return ![...graph.keys()].some((node) => hasCycle(node));
}

export function unmetPublishConditions(input: {
  tableCount: number;
  columns: MasterColumn[] | null;
  userCount: number;
}): PublishCondition[] {
  const unmet: PublishCondition[] = [];
  if (input.tableCount < 1) {
    unmet.push('At least one table');
  }
  if (!input.columns || input.columns.length < 1) {
    unmet.push('At least one column');
  }
  if (input.userCount < 1) {
    unmet.push('At least one user');
  }
  if (!input.columns || !formulasAreValid(input.columns)) {
    unmet.push('Valid formulas');
  }
  const routingCount = (input.columns || []).filter((column) => column.type === 'routing').length;
  if (routingCount !== 1) {
    unmet.push('Valid routing config');
  }
  return unmet;
}

export function masterTableReferences(columns: unknown, joins: unknown, tableId: string): boolean {
  const columnList = asArray<MasterColumn>(columns);
  const joinList = asArray<MasterJoin>(joins);
  return (
    columnList.some((column) => column.source_table_id === tableId || column.lookup_table_id === tableId) ||
    joinList.some((join) => join.base_table_id === tableId || join.join_table_id === tableId)
  );
}
