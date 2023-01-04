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

import TaskState from '@/model/TaskState.model'

describe('Tree view', () => {
  it('Should display cycle points for the mocked workflow', () => {
    cy.visit('/#/workflows/one')
    cy
      .get('.node-data-cycle')
      .should(($div) => {
        // by default, in our expected viewport size for tests, both cycle points exist and are visible
        expect($div.get(0)).to.contain('20000102T0000Z')
      })
    cy
      .get('.node-data-cycle')
      .should('be.visible')
  })
  it('Should hide jobs by default', () => {
    cy.visit('/#/workflows/one')
    cy
      .get('.node-data-cycle')
      .should('be.visible')
    cy
      .get('.node-data-job')
      .should('not.be.visible')
  })
  it('Should make jobs visible when clicking on tasks', () => {
    cy.visit('/#/workflows/one')
    cy
      .get('.node-data-job:first')
      .should('not.be.visible')
    // expand the first task proxy we have
    cy
      .get('.node-data-task:first')
      .prev()
      .click()
    // now, consequentially, the first job that we have should also be visible
    cy
      .get('.node-data-job:first')
      .should('be.visible')
  })
  it('Should display leaf node triangle with margin', () => {
    // this is testing that there is a margin, not necessarily that the leaf node's triangle is exactly under the node
    cy.visit('/#/workflows/one')
    cy
      .get('.node-data-task:first')
      .prev()
      .click()
    // no jobs, and no leaves are visible initially
    cy
      .get('.leaf:first')
      .should('not.be.visible')
    // but clicking on a visible job should display its leaf node
    cy
      .get('.node-data-job:first')
      .prev()
      .click()
    cy
      .get('.leaf:first')
      .should('be.visible')
    // and, important, the leaf node has a triangle, as a helper to quickly point the user to its parent
    // job in the tree - i.e. the leaf has a left margin... as the leaves are not root nodes, we
    // **always** have a margin > 0, unless a bug broke it (which happened before due to a wrong variable name).
    cy
      .get('.leaf:first > .arrow-up')
      .should(($div) => {
        const marginLeft = $div.get(0).style.marginLeft
        if (
          marginLeft === undefined ||
          marginLeft === '' ||
          marginLeft === '0' ||
          marginLeft === '0px'
        ) {
          throw new Error(`Invalid leaf node margin-left: "${marginLeft}"`)
        }
      })
  })
  it('Should update view correctly', () => {
    cy.visit('/#/tree/one')
    cy
      .get('.node-data-cycle')
      .should('have.length', 1)
    cy
      .get('.node-data-job:first')
      .should('not.be.visible')
    cy
      .visit('/#/tree/anynamewillstillopenone')
      .then(() => {
        cy
          .get('.node-data')
          .should('have.length', 0)
        cy.window().its('app.$workflowService.subscriptions').then(subscriptions => {
          // GScan 'root' subscription, and the 'workflow' subscription used by the Tree view
          expect(Object.keys(subscriptions).length).to.equal(2)
          expect(subscriptions.root.observable.closed).to.equal(false)
          expect(subscriptions.workflow.observable.closed).to.equal(false)
        })
      })
  })
  it('Should remove subscriptions correctly when leaving the view', () => {
    cy.visit('/#/tree/one')
    cy
      .get('.node-data-cycle')
      .should('be.visible')
    cy
      .get('.node-data-job:first')
      .should('not.be.visible')
    cy.window().its('app.$workflowService.subscriptions').then(subscriptions => {
      // Gscan 'root', the 'workflow subscription used by the Tree view
      expect(Object.keys(subscriptions).length).to.equal(2)
      expect(subscriptions.root.observable.closed).to.equal(false)
      expect(subscriptions.workflow.observable.closed).to.equal(false)
    })
    cy
      .visit('/#/')
    cy.get('.c-dashboard').should('be.visible')
    cy.window().its('app.$workflowService.subscriptions').then(subscriptions => {
      // It will have 2, GScan + Dashboard, while the /tree/one view has 1 Delta + 1 subscription
      // (the delta is a different subscription).
      expect(Object.keys(subscriptions).length).to.equal(1)
      // Gscan remains open in the dashboard view, the 'workflow' subscription is gone since it's not used
      expect(subscriptions.root.observable.closed).to.equal(false)
    })
  })
  it('Should display message triggers', () => {
    cy.visit('/#/tree/one')

    // find the task proxy
    cy
      .get('.mx-1')
      .contains('eventually_succeeded')
      .parent()
      .parent()

      // expand the job nodes
      .find('.node-expand-collapse-button')
      .click({ force: true })
      .parent()
      .parent()

      // the jobs should be visible
      .find('.node-data-job')
      .should('be.visible')

      // the first job should have 5 outputs (the maximum number we display)
      .first()
      .find('.message-output')
      .should('have.length', 5)

      // the remainder should be referenced in an overflow counter +2
      .parent()
      .contains('+2')
      .parent()
      .parent()
      .parent()
      .parent()

      // expand the job details node
      .find('.node-expand-collapse-button')
      .click({ force: true })

      // all 7 outputs/messages should be listed in the job-details
      .parent()
      .parent()
      .find('.job-details')
      .find('.output')
      .should('have.length', 7)
  })

  describe('filters', () => {
    const initialNumTasks = 7
    it('Should filter by task name', () => {
      cy.visit('/#/tree/one')
      // Should not filter by default
      cy
        .get('.node-data-task:visible')
        .should('have.length', initialNumTasks)
        .contains('waiting')
      // eep should filter sleepy
      cy
        .get('[data-cy=filter-task-name]')
        .type('eep')
      cy
        .get('.node-data-task:visible')
        .should('have.length.lessThan', initialNumTasks)
        .contains('sleepy')
      cy
        .get('.node-data-task')
        .contains('waiting')
        .should('not.be.visible')
      // It should stop filtering when input is cleared
      cy.get('[data-cy=filter-task-name]')
        .clear()
        .get('.node-data-task:visible')
        .should('have.length', initialNumTasks)
    })
    it('Should filter by task states', () => {
      cy.visit('/#/tree/one')
      cy
        .get('.node-data-task')
        .contains(TaskState.FAILED.name)
        .should('be.visible')
      cy
        .get('[data-cy=filter-task-states]')
        .click({ force: true })
      cy
        .get('.v-list-item')
        .contains(TaskState.RUNNING.name)
        .click({ force: true })
      cy
        .get('.node-data-task')
        .contains(TaskState.FAILED.name)
        .should('be.not.visible')
      cy
        .get('.node-data-task:visible')
        .should('have.length', 1)
    })
    it('Should filter by task name and states', () => {
      cy.visit('/#/tree/one')
      cy
        .get('.node-data-task')
        .contains('failed')
        .should('be.visible')
      cy
        .get('[data-cy=filter-task-name]')
        .type('i')
      cy
        .get('[data-cy=filter-task-states]')
        .click({ force: true })
        .get('.v-list-item')
        .contains(TaskState.WAITING.name)
        .click({ force: true })
      cy
        .get('.node-data-task:visible')
        .should('have.length', 1)
        .contains('retrying')
    })
  })

  describe('Expand/collapse all buttons', () => {
    it('Collapses and expands as expected', () => {
      cy.visit('/#/tree/one')
      cy.get('.node-data-task')
        .contains('sleepy')
        .as('sleepyTask')
        .should('be.visible')
      cy.get('[data-cy=collapse-all]')
        .click()
        .get('@sleepyTask')
        .should('not.be.visible')
        .get('[data-cy=expand-all]')
        .click()
        .get('@sleepyTask')
        .should('be.visible')
    })
    it('Works when tasks are being filtered', () => {
      cy.visit('/#/tree/one')
      cy.get('.node-data-task')
        .contains('sleepy')
        .as('sleepyTask')
        .should('be.visible')
      cy.get('[data-cy=filter-task-name]')
        .type('sleep')
      cy.get('[data-cy=collapse-all]')
        .click()
        .get('@sleepyTask')
        .should('not.be.visible')
        .get('[data-cy=expand-all]')
        .click()
        .get('@sleepyTask')
        .should('be.visible')
    })
  })

  it('should show a summary of tasks if the number of selected items is greater than the maximum limit', () => {
    cy.visit('/#/tree/one')
    cy
      .get('[data-cy=filter-task-states]')
      .click({ force: true })
    // eslint-disable-next-line no-lone-blocks
    TaskState.enumValues.forEach(state => {
      cy.get('.v-list-item')
        .contains(state.name)
        .click({ force: true })
    })
    // Click outside to close dropdown
    cy.get('noscript')
      .click({ force: true })
    cy.get('.v-select__slot')
      .should($select => {
        expect($select).to.contain('(+')
      })
  })
})
