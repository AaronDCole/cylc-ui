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

import { expect } from 'chai'
import Vue from 'vue'
import Vuex from 'vuex'
import storeOptions from '@/store/options'

Vue.use(Vuex)

/**
 * Tests for the store/table module.
 */
describe('table', () => {
  const store = new Vuex.Store(storeOptions)
  if (!global.localStorage) {
    global.localStorage = {}
  }
  const resetState = () => {
    store.state.table.lookup = {}
    store.state.table.table = {}
  }
  beforeEach(resetState)
  afterEach(resetState)
  describe('State', () => {
    it('should start with empty table', () => {
      expect(Object.keys(store.state.workflows.lookup).length).to.deep.equal(0)
      expect(store.state.table.table).to.deep.equal({})
    })
  })
  describe('Mutations', () => {
    it('should set table', () => {
      const table = {
        '~cylc/cylc': {
          id: '~cylc/cylc',
          name: 'cylc'
        }
      }
      store.commit('table/SET_TABLE', table)
      expect(store.state.table.table).to.deep.equal(table)
    })
  })
})
