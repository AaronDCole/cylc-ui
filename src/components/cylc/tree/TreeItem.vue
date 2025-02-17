<!--
Copyright (C) NIWA & British Crown (Met Office) & Contributors.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<template>
  <div class="treeitem" v-show="filtered">
    <v-flex
      class="node d-flex align-center"
      :class="nodeClass"
      :style="nodeStyle"
    >
      <!-- the node's left icon; used for expand/collapse -->
      <v-icon
        aria-label="Expand/collapse"
        role="img"
        aria-hidden="false"
        class="node-expand-collapse-button"
        v-if="shouldRenderExpandCollapseBtn"
        @click="toggleExpandCollapse"
        :style="expandCollapseBtnStyle"
      >{{ icons.mdiChevronRight }}</v-icon>
      <!-- the node value -->
      <!-- TODO: revisit these values that can be replaced by constants later (and in other components too). -->
      <slot name="cyclepoint" v-if="node.type === 'cyclepoint'">
        <div :class="getNodeDataClass()" @click="nodeClicked">
          <task
            v-cylc-object="node.node.id"
            :key="node.node.id"
            :status="node.node.state"
            :isHeld="node.node.isHeld"
            :isQueued="node.node.isQueued"
            :isRunahead="node.node.isRunahead"
          />
          <span class="mx-1">{{ node.node.name }}</span>
        </div>
      </slot>
      <slot name="family-proxy" v-else-if="node.type === 'family-proxy'">
        <div :class="getNodeDataClass()" @click="nodeClicked">
          <task
            v-cylc-object="node.node.id"
            :key="node.node.id"
            :status="node.node.state"
            :isHeld="node.node.isHeld"
            :isQueued="node.node.isQueued"
            :isRunahead="node.node.isRunahead"
          />
          <span class="mx-1">{{ node.node.name }}</span>
        </div>
      </slot>
      <slot name="task-proxy" v-else-if="node.type === 'task-proxy'">
        <div :class="getNodeDataClass()" @click="nodeClicked">
          <!-- Task summary -->
          <task
            v-cylc-object="node.node.id"
            :key="node.node.id"
            :status="node.node.state"
            :isHeld="node.node.isHeld"
            :isQueued="node.node.isQueued"
            :isRunahead="node.node.isRunahead"
            :startTime="taskStartTime(node.node, latestJob(node))"
            :estimatedDuration="taskEstimatedDuration(node.node)"
          />
          <div v-if="!isExpanded" class="node-summary">
            <!-- most recent job summary -->
            <job
              v-for="(job, index) in node.children.slice(0, 1)"
              v-cylc-object="job.id"
              :key="`${job.id}-summary-${index}`"
              :status="job.node.state"
              :previous-state="node.children.length > 1 ? node.children[1].node.state : ''"
              style="margin-left: 0.25em;"
            />
          </div>
          <span class="mx-1">{{ node.node.name }}</span>
        </div>
      </slot>
      <slot name="job" v-else-if="node.type === 'job'">
        <div :class="getNodeDataClass()" @click="nodeClicked">
          <job
            v-cylc-object="node.node.id"
            :key="node.node.id"
            :status="node.node.state"
          />
          <span class="mx-1">#{{ node.node.submitNum }}</span>
          <span class="grey--text">{{ node.node.platform }}</span>
          <span
            class="grey--text d-flex flex-nowrap flex-row align-center"
            v-if="node.node.customOutputs.length > 0"
          >
            <!--
              We had a tricky bug in #530 due to the :key here. In summary, the list
              that is backing this component changes. It contains zero or more entries,
              up to N (5 at the time of writing).
              Initially we used `:key=customOutput.id` here. But Vue tried to avoid
              changing the DOM elements, which caused some elements to be out of order
              in the final rendered UI (as Vue was trying to optimize and keep the
              DOM elements in-place whenever possible).
              That behaviour is not deterministic, so sometimes you would have the list
              in order. The fix was to use a key that combines a string with the list
              iteration `index` (the `:key` value must be unique, so we used output-chip
              prefix).
              @see https://github.com/cylc/cylc-ui/pull/530#issuecomment-781076619
            -->
            <v-tooltip
              v-for="(customOutput, index) of [...node.node.customOutputs].slice(0, 5)"
              :key="`output-chip-${index}`"
              bottom
            >
              <template v-slot:activator="{ on, attrs }">
                <v-chip
                  v-bind="attrs"
                  v-on="on"
                  color="grey"
                  text-color="grey lighten-5"
                  class="ml-2"
                  small
                >{{ customOutput.label }}</v-chip>
              </template>
              <span>{{ customOutput.message }}</span>
            </v-tooltip>
            <v-chip
              v-if="node.node.customOutputs.length > 5"
              color="grey"
              text-color="grey lighten-5"
              class="ml-2"
              small
              link
              @click="toggleExpandCollapse"
            >+{{ node.node.customOutputs.length - 5 }}</v-chip>
          </span>
        </div>
      </slot>
      <slot name="job-details" v-else-if="node.type === 'job-details'">
        <div class="leaf">
          <div class="arrow-up" :style="leafTriangleStyle"></div>
          <div class="leaf-data font-weight-light py-4 pl-2">
            <div
              v-for="jobDetail in node.node.details"
              :key="jobDetail.id"
              class="leaf-entry"
            >
              <span class="px-4 leaf-entry-title">{{ jobDetail.title }}</span>
              <span class="grey--text leaf-entry-value">{{ jobDetail.value }}</span>
            </div>
            <v-divider class="ml-3 mr-5" />
            <div class="leaf-entry">
              <span class="px-4 leaf-entry-title grey--text text--darken-1">outputs</span>
            </div>
            <div
              v-if="node.node.customOutputs && node.node.customOutputs.length > 0"
              class="leaf-outputs-entry"
            >
              <div
                v-for="customOutput of node.node.customOutputs"
                :key="`${customOutput.id}-leaf`"
                class="leaf-entry"
              >
                <span class="px-4 leaf-entry-title">{{ customOutput.label }}</span>
                <span class="grey--text leaf-entry-value">{{ customOutput.message }}</span>
              </div>
            </div>
            <div v-else class="leaf-entry">
              <span class="px-4 leaf-entry-title grey--text text--darken-1">No custom messages</span>
            </div>
          </div>
        </div>
      </slot>
      <slot
        v-bind:node="node"
        name="node"
        v-else
      >
        <div :class="getNodeDataClass()">
          <span
            v-if="node && node.node"
            @click="nodeClicked"
            :key="node.node.id"
            class="mx-1">{{ node.node.name }}</span>
        </div>
      </slot>
      <slot></slot>
    </v-flex>
    <span v-show="isExpanded">
      <!-- component recursion -->
      <TreeItem
        v-for="child in node.children"
        ref="treeitem"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :hoverable="hoverable"
        :initialExpanded="initialExpanded"
        v-on:tree-item-created="$listeners['tree-item-created']"
        v-on:tree-item-destroyed="$listeners['tree-item-destroyed']"
        v-on:tree-item-expanded="$listeners['tree-item-expanded']"
        v-on:tree-item-collapsed="$listeners['tree-item-collapsed']"
        v-on:tree-item-clicked="$listeners['tree-item-clicked']"
      >
        <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope"><slot :name="slot" v-bind="scope"/></template>
      </TreeItem>
    </span>
  </div>
</template>

<script>
import { mdiChevronRight } from '@mdi/js'
import Task from '@/components/cylc/Task'
import Job from '@/components/cylc/Job'
import { taskStartTime, taskEstimatedDuration, latestJob } from '@/utils/tasks'

/**
 * Offset used to move nodes to the right or left, to represent the nodes hierarchy.
 * @type {number} integer
 */
const NODE_DEPTH_OFFSET = 1.5 // em

export default {
  name: 'TreeItem',
  components: {
    task: Task,
    job: Job
  },
  props: {
    node: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    },
    hoverable: Boolean,
    initialExpanded: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      active: false,
      selected: false,
      isExpanded: this.initialExpanded,
      filtered: true,
      leafProperties: [
        {
          title: 'platform',
          property: 'platform'
        },
        {
          title: 'job id',
          property: 'jobId'
        },
        {
          title: 'batch sys',
          property: 'jobRunnerName'
        },
        {
          title: 'submit time',
          property: 'submittedTime'
        },
        {
          title: 'start time',
          property: 'startedTime'
        },
        {
          title: 'finish time',
          property: 'finishedTime'
        }
      ],
      icons: {
        mdiChevronRight
      }
    }
  },
  computed: {
    hasChildren () {
      return Boolean(this.node.children?.length)
    },
    /** Get the node indentation in units of em. */
    nodeIndentation () {
      return this.depth * NODE_DEPTH_OFFSET
      // Note: this should actually depend on the expand/collapse icon size, but
      // fortuitously, the vuetify default icon size is 24px which is 1.5em for
      // a font-size of 16px
    },
    nodeStyle () {
      return {
        'padding-left': `${this.node.type === 'job-details' ? 0 : this.nodeIndentation}em`
      }
    },
    nodeClass () {
      return {
        'node--hoverable': this.hoverable,
        'node--active': this.active,
        expanded: this.isExpanded
      }
    },
    expandCollapseBtnStyle () {
      const styles = {}
      if (!this.hasChildren) {
        styles.visibility = 'hidden'
      }
      return styles
    },
    /**
     * Whether the expand collapse button for this TreeItem should be rendered.
     *
     * Note for workflow leafs it will still be rendered but be hidden. This is
     * to maintain the correct indentation.
     */
    shouldRenderExpandCollapseBtn () {
      return this.hasChildren || !['workflow', 'job-details'].includes(this.node.type)
      // Do not render for GSscan leafs or job details
    },
    /** Make the job details triangle point to the job icon */
    leafTriangleStyle () {
      return {
        'margin-left': `${this.nodeIndentation}em`
      }
    }
  },
  created () {
    this.$emit('tree-item-created', this)
  },
  beforeDestroy () {
    this.$emit('tree-item-destroyed', this)
  },
  beforeMount () {
    if (this.node.expanded !== undefined && this.node.expanded !== null) {
      this.isExpanded = this.node.expanded
      this.emitExpandCollapseEvent(this.isExpanded)
    }
  },
  methods: {
    toggleExpandCollapse () {
      this.isExpanded = !this.isExpanded
      this.emitExpandCollapseEvent(this.isExpanded)
    },
    /**
     * Emits an event `tree-item-expanded` if `expanded` is true, or emits
     * `tree-item-collapsed` if `expanded` is false.
     * @param {boolean} expanded whether the node is expanded or not
     */
    emitExpandCollapseEvent (expanded) {
      if (expanded) {
        this.$emit('tree-item-expanded', this)
      } else {
        this.$emit('tree-item-collapsed', this)
      }
    },
    /**
     * Handler for when any node of the tree was clicked, except jobs.
     * @param {event} e event
     */
    nodeClicked (e) {
      this.$emit('tree-item-clicked', this)
    },
    getNodeDataClass () {
      const classes = {}
      classes['node-data'] = true
      classes[`node-data-${this.node.type}`] = true
      return classes
    },
    taskStartTime,
    taskEstimatedDuration,
    latestJob
  }
}
</script>
