/**
 * Dev Coach - Action Validator
 * Validates coach actions against a strict schema and allowlist.
 * Allowed types: DONE, UNDONE, ADD_TASK, NOTE.
 * Unknown types and invalid schemas are rejected.
 */

export const ALLOWED_ACTION_TYPES = Object.freeze([
  'DONE',
  'UNDONE',
  'ADD_TASK',
  'NOTE'
]);

/**
 * Validates a single action object.
 * @param {object} action 
 * @param {Set<string>|Array<string>} [validTaskIds] - Optional set/array of known task IDs
 * @returns {{ valid: boolean, action?: object, error?: string }}
 */
export function validateSingleAction(action, validTaskIds = null) {
  if (!action || typeof action !== 'object' || Array.isArray(action)) {
    return { valid: false, error: 'Action must be an object' };
  }

  const { type, data } = action;

  if (typeof type !== 'string' || !ALLOWED_ACTION_TYPES.includes(type)) {
    return { valid: false, error: `Invalid action type: ${type}` };
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, error: 'Action data must be an object' };
  }

  const idSet = validTaskIds ? (validTaskIds instanceof Set ? validTaskIds : new Set(validTaskIds)) : null;

  switch (type) {
    case 'DONE':
    case 'UNDONE': {
      if (typeof data.id !== 'string' || !data.id.trim()) {
        return { valid: false, error: `${type} requires non-empty string "id"` };
      }
      const trimmedId = data.id.trim();
      if (idSet && !idSet.has(trimmedId)) {
        return { valid: false, error: `Unknown task ID: ${trimmedId}` };
      }
      return {
        valid: true,
        action: {
          type,
          data: { id: trimmedId }
        }
      };
    }

    case 'ADD_TASK': {
      const day = Number(data.day);
      if (!Number.isInteger(day) || day < 1 || day > 21) {
        return { valid: false, error: 'ADD_TASK day must be an integer between 1 and 21' };
      }

      if (typeof data.title !== 'string' || !data.title.trim()) {
        return { valid: false, error: 'ADD_TASK requires a non-empty string "title"' };
      }

      const title = data.title.trim().slice(0, 200);
      const note = typeof data.note === 'string' ? data.note.trim().slice(0, 500) : '';

      return {
        valid: true,
        action: {
          type,
          data: {
            day,
            title,
            ...(note ? { note } : {})
          }
        }
      };
    }

    case 'NOTE': {
      if (typeof data.id !== 'string' || !data.id.trim()) {
        return { valid: false, error: 'NOTE requires non-empty string "id"' };
      }
      const trimmedId = data.id.trim();
      if (idSet && !idSet.has(trimmedId)) {
        return { valid: false, error: `Unknown task ID: ${trimmedId}` };
      }

      if (typeof data.note !== 'string') {
        return { valid: false, error: 'NOTE requires a string "note"' };
      }

      return {
        valid: true,
        action: {
          type,
          data: {
            id: trimmedId,
            note: data.note.trim().slice(0, 500)
          }
        }
      };
    }

    default:
      return { valid: false, error: `Unhandled action type: ${type}` };
  }
}

/**
 * Validates a list of actions, filtering out any invalid or disallowed actions.
 * @param {Array<object>} actions
 * @param {Set<string>|Array<string>} [validTaskIds]
 * @returns {Array<object>} Array of sanitized, validated actions
 */
export function validateActions(actions, validTaskIds = null) {
  if (!Array.isArray(actions)) return [];

  const validated = [];
  for (const rawAction of actions) {
    const res = validateSingleAction(rawAction, validTaskIds);
    if (res.valid && res.action) {
      validated.push(res.action);
    }
  }
  return validated;
}

