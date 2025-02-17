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
import { createLocalVue, mount } from '@vue/test-utils'
import { expect } from 'chai'
import Vuetify from 'vuetify/lib'
import { simpleTableTasks } from './table.data'
import TaskState from '@/model/TaskState.model'
import CylcObjectPlugin from '@/components/cylc/cylcObject/plugin'
import Table from '@/components/cylc/table/Table'

Vue.use(Vuetify)

const localVue = createLocalVue()
localVue.prototype.$eventBus = {
  emit: () => {}
}
localVue.prototype.$workflowService = {
  register: function () {
  },
  unregister: function () {
  },
  subscribe: function () {
  },
  mutations: [
    {
      args: []
    }
  ]
}
localVue.use(CylcObjectPlugin)

describe('Table component', () => {
  let vuetify
  beforeEach(() => {
    vuetify = new Vuetify({
      theme: { disable: true },
      icons: {
        iconfont: 'mdi'
      }
    })
  })
  // mount function from Vuetify docs https://vuetifyjs.com/ru/getting-started/unit-testing/
  /**
   * @param options
   * @returns {Wrapper<Tree>}
   */
  const mountFunction = options => {
    // the mocks.$vuetify is for https://github.com/vuetifyjs/vuetify/issues/9923
    return mount(Table, {
      localVue,
      mocks: {
        $vuetify: {
          lang: {
            t: (val) => val
          }
        }
      },
      vuetify,
      ...options
    })
  }
  global.requestAnimationFrame = cb => cb()
  it('should display the table with valid data', () => {
    const wrapper = mountFunction({
      propsData: {
        tasks: simpleTableTasks
      }
    })
    expect(wrapper.props().tasks[0].node.name).to.equal('taskA')
    expect(wrapper.find('div')).to.not.equal(null)
  })
  describe('Filter', () => {
    describe('Filter by name', () => {
      it('should not filter by name or tasks by default', () => {
        const wrapper = mountFunction({
          propsData: {
            tasks: simpleTableTasks
          }
        })
        expect(wrapper.vm.activeFilters).to.equal(null)
        expect(wrapper.vm.filteredTasks.length).to.equal(3)
        wrapper.vm.filterTasks()
        expect(wrapper.vm.filteredTasks.length).to.equal(3)
      })
      it('should filter by name', () => {
        const wrapper = mountFunction({
          propsData: {
            tasks: simpleTableTasks
          },
          data () {
            return {
              tasksFilter: {
                name: 'taskA'
              }
            }
          }
        })
        expect(wrapper.vm.filteredTasks.length).to.equal(3)
        wrapper.vm.filterTasks()
        expect(wrapper.vm.filteredTasks.length).to.equal(1)
      })
      it('should filter by task state', () => {
        const wrapper = mountFunction({
          propsData: {
            tasks: simpleTableTasks
          },
          data () {
            return {
              tasksFilter: {
                name: '',
                states: [
                  TaskState.WAITING.name
                ]
              }
            }
          }
        })
        expect(wrapper.vm.filteredTasks.length).to.equal(3)
        wrapper.vm.filterTasks()
        expect(wrapper.vm.filteredTasks.length).to.equal(1)
      })
      it('should filter by task name and state', () => {
        const wrapper = mountFunction({
          propsData: {
            tasks: simpleTableTasks
          },
          data () {
            return {
              tasksFilter: {
                name: 'taskA',
                states: [
                  TaskState.WAITING.name
                ]
              }
            }
          }
        })
        expect(wrapper.vm.filteredTasks.length).to.equal(3)
        wrapper.vm.filterTasks()
        expect(wrapper.vm.filteredTasks.length).to.equal(0)
      })
    })
  })
})
