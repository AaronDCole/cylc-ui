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
  <v-list-item-action-text class="pt-3 pb-3 c-header">
    <v-layout align-center justify-center row wrap fill-height>
      <div class="mb-2 px-8">
        <svg version="1.1" preserveAspectRatio="xMinYMin meet" width="100%" height="100%" viewBox="0 0 655 260" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(292.53,-49.505)">
            <g>
              <g>
                <g>
                  <circle r="27.743086" cy="248.39331" cx="-135.70163" transform="scale(-1,1)" style="fill:#ff5966;fill-opacity:1;stroke:none;stroke-width:1.29467726;stroke-opacity:1"/>
                  <circle r="72.85714" cy="216.6479" cx="201.04846" style="fill:#0dc66e;fill-opacity:1;fill-rule:evenodd;stroke:none;stroke-opacity:1"/>
                  <circle r="37.37936" cy="136.32114" cx="167.3486" style="fill:#ffcc00;fill-opacity:1;stroke:none;stroke-width:1.18934333;stroke-opacity:1"/>
                  <circle r="49.79998" cy="121.63028" cx="292.31558" style="fill:#00b4fd;fill-opacity:1;stroke:none;stroke-width:0.91736811;stroke-opacity:1"/>
                  <path d="m -239.15268,150.44225 q 5.28,0 17.92,1.92 l 3.84,0.48 -0.48,9.76 q -12.8,-1.44 -18.88,-1.44 -13.6,0 -18.56,6.56 -4.8,6.4 -4.8,24 0,17.44 4.48,24.32 4.64,6.88 19.04,6.88 l 18.88,-1.44 0.48,9.92 q -14.88,2.24 -22.24,2.24 -18.72,0 -25.92,-9.6 -7.04,-9.6 -7.04,-32.32 0,-22.88 7.68,-32 7.68,-9.28 25.6,-9.28 z" style="fill:#ff5966;fill-opacity:1;stroke:none"/>
                  <path d="m -175.59268,152.04225 h 12 l 20,69.6 h 5.28 l 20.16,-69.6 h 12 l -33.28,115.52 h -12 l 10.4,-35.52 h -11.84 z" style="fill:#ffcc00;fill-opacity:1;stroke:none"/>
                  <path d="m -58.612682,232.04225 v -114.88 h 12 v 114.88 z" style="fill:#0dc66e;fill-opacity:1;stroke:none"/>
                  <path d="m 34.534818,150.44225 q 5.28,0 17.92,1.92 l 3.84,0.48 -0.48,9.76 q -12.8,-1.44 -18.88,-1.44 -13.6,0 -18.56,6.56 -4.8,6.4 -4.8,24 0,17.44 4.48,24.32 4.64,6.88 19.04,6.88 l 18.88,-1.44 0.48,9.92 q -14.88,2.24 -22.24,2.24 -18.72,0 -25.9199999,-9.6 -7.04,-9.6 -7.04,-32.32 0,-22.88 7.68,-32 7.6799999,-9.28 25.5999999,-9.28 z" style="fill:#00b4fd;fill-opacity:1;stroke:none"/>
                </g>
              </g>
            </g>
          </g>
        </svg>
      </div>
      <div class="c-environment-info">
        <v-chip id="username" outlined color="grey lighten-1" text-color="grey darken-4">{{ user }}</v-chip>
        <span class="at">@</span>
        <v-chip id="host" outlined color="grey lighten-1" text-color="grey darken-4">{{ environment }}</v-chip>
      </div>
    </v-layout>
  </v-list-item-action-text>
</template>

<script>
export default {
  name: 'Header',
  props: {
    user: {
      type: String,
      default: 'guest'
    },
    environment: {
      type: String,
      default: window.location.host
    }
  }
}
</script>
