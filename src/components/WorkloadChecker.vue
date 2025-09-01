<!-- src/components/WorkloadChecker.vue -->
<template>
  <div>
    <el-button @click="checkAll" type="primary">Check Workload</el-button>
    <div v-if="checked">
      <el-tag type="success" v-if="allGood">All staff workloads met</el-tag>
      <el-tag type="danger" v-else>Some workloads unmet</el-tag>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
const props = defineProps({
  staff: { type: Array, required: true }
});
const checked = ref(false);
const allGood = ref(false);

function checkAll() {
  // Example logic: check if each staff's hours >= required
  const unmet = props.staff.find(s => {
    return (
      (s.teachingHours || 0) < (s.required?.teaching || 0) ||
      (s.researchHours || 0) < (s.required?.research || 0) ||
      (s.serviceHours || 0) < (s.required?.service || 0)
    );
  });
  allGood.value = !unmet;
  checked.value = true;
}
</script>
