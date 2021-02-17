/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import Vue from 'vue'

import { VTextField } from 'vuetify/lib/components/VTextField'
import { VSwitch } from 'vuetify/lib/components/VSwitch'

import GEnum from '@/components/graphqlFormGenerator/components/Enum'
import GNonNull from '@/components/graphqlFormGenerator/components/NonNull'
import GList from '@/components/graphqlFormGenerator/components/List'
import GObject from '@/components/graphqlFormGenerator/components/Object'

/* Vuetify number input component.
 *
 * Note: Vuetify doesn't supply a dedicated number field, instead you
 *       specialise the text field using `type='number'`, this, however,
 *       does not cast values to `Number` for you so this extension parses
 *       values to `Number` so they can be used directly in the data model.
 */
const VNumberField = Vue.component(
  'v-number-field',
  {
    extends: VTextField,
    computed: {
      internalValue: {
        get () {
          return this.lazyValue
        },
        set (val) {
          // cast values on `set` operations, note this does not get
          // called on creation
          this.lazyValue = Number(val)
          this.$emit('input', this.lazyValue)
        }
      }
    }
  })

const RULES = {
  integer:
    x => (!x || Number.isInteger(x)) || 'Integer',
  noSpaces:
    x => (!x || !x.includes(' ')) || 'Cannot contain spaces',
  cylcConfigItem:
    // PERMIT [a][b]c, a, [a] PROHIBIT a[b], [b]a, a], ]a
    x => Boolean(!x || x.match(/^((\[[^=\]]+\])+)?([^[=\]-]+)?$/)) || 'Invalid',
  taskID:
    // PERMIT A.1 PROHIBIT a
    x => Boolean(!x || x.match(/^(.){1,}\.(.){1,}$/)) || 'Invalid'
}

export default {
  defaultProps: {
    // default props for all form inputs
    filled: true,
    rounded: true,
    dense: true
  },

  namedTypes: {
    // registry of GraphQL "named types" (e.g. String)
    // {namedType: {is: ComponentClass, prop1: value, ...}}
    //
    // * GraphQL types *
    String: {
      is: VTextField
    },
    Int: {
      is: VNumberField,
      type: 'number',
      rules: [
        RULES.integer
      ]
    },
    Float: {
      is: VNumberField,
      type: 'number'
    },
    Boolean: {
      is: VSwitch,
      color: 'blue darken-3'
    },

    // * Cylc types *
    //
    WorkflowID: {
      is: VTextField,
      rules: [
        RULES.noSpaces
      ]
    },
    User: {
      is: VTextField,
      rules: [
        RULES.noSpaces
      ]
    },
    CyclePoint: {
      is: VTextField,
      rules: [
        RULES.noSpaces,
        // character whitelist
        x => Boolean(!x || x.match(/^[\dT]+(Z|[+-]\d+)?$/)) || 'Invalid Cycle Point'
      ]
    },
    CyclePointGlob: {
      is: VTextField,
      rules: [
        RULES.noSpaces,
        // character whitelist
        x => Boolean(!x || x.match(/^[\dT*]+$/)) || 'Invalid Cycle Point Glob'
      ]
    },
    // BroadcastSetting
    // TaskStatus
    // TaskState
    TaskName: {
      is: VTextField,
      rules: [
        RULES.noSpaces
      ]
    },
    TaskID: {
      is: VTextField,
      placeholder: 'name.cycle',
      rules: [
        RULES.noSpaces,
        RULES.taskID
      ]
    },
    NamespaceName: {
      is: VTextField,
      rules: [
        RULES.noSpaces
      ]
    },
    NamespaceIDGlob: {
      is: VTextField,
      placeholder: 'name[.cycle][:status]',
      rules: [
        RULES.noSpaces
      ]
    },
    TimePoint: {
      is: VTextField,
      placeholder: 'yyyy-mm-ddThh:mm:ss',
      mask: '####-##-##T##:##:##'
    },
    RuntimeConfiguration: {
      is: VTextField,
      placeholder: '[section]setting',
      rules: [
        RULES.cylcConfigItem
      ]
    }
  },

  kinds: {
    // registry of GraphQL "kinds" (e.g. LIST)
    // {namedType: {is: ComponentClass, prop1: value, ...}}
    ENUM: {
      is: GEnum
    },
    NON_NULL: {
      is: GNonNull
    },
    LIST: {
      is: GList
    },
    INPUT_OBJECT: {
      is: GObject // happy naming coincidence
    }
  }
}
