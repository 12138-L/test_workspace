<template>
  <n-modal v-model:show="showModal" preset="card" title="🔐 数据库加密状态" style="width: 600px">
    <n-space vertical size="large">
      <n-alert
        :type="isEncrypted ? 'success' : 'warning'"
        :title="isEncrypted ? '加密已启用' : '加密未启用'"
      >
        {{ isEncrypted ? '所有敏感字段已自动 AES-256 加密存储' : '数据以明文存储在 IndexedDB 中' }}
      </n-alert>

      <n-grid :cols="2" x-gap="12">
        <n-gi>
          <n-statistic label="加密算法" value="AES-GCM" value-style="color: #18a058">
            <template #suffix>
              <span style="font-size: 14px">256位</span>
            </template>
          </n-statistic>
        </n-gi>
        <n-gi>
          <n-statistic label="密钥派生" value="PBKDF2" value-style="color: #2080f0">
            <template #suffix>
              <span style="font-size: 14px">10万轮</span>
            </template>
          </n-statistic>
        </n-gi>
      </n-grid>

      <n-divider>加密字段清单</n-divider>

      <n-space vertical size="medium">
        <n-tag v-for="field in encryptedFields" :key="field" type="info">
          {{ field }}
        </n-tag>
      </n-space>

      <n-divider>加密验证</n-divider>

      <n-space>
        <n-button @click="testEncryption" type="primary"> 运行加密自测 </n-button>
        <n-button @click="toggleEncryption">
          {{ isEncrypted ? '临时禁用加密' : '启用加密' }}
        </n-button>
      </n-space>

      <n-alert v-if="testResult" :type="testResult.passed ? 'success' : 'error'" title="自测结果">
        <n-text code>{{ testResult.message }}</n-text>
      </n-alert>
    </n-space>
  </n-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { message } from '@/utils/naive'
import {
  generateEncryptionKey,
  importEncryptionKey,
  encryptValue,
  decryptValue
} from '@/utils/crypto'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const userStore = useUserStore()
const testResult = ref<{ passed: boolean; message: string } | null>(null)

const showModal = computed({
  get: () => props.show,
  set: value => emit('update:show', value)
})

const isEncrypted = computed(() => userStore.isEncryptionActive)

const encryptedFields = [
  'email',
  'phone',
  'remark',
  'description',
  'reason',
  'content',
  'password',
  'token'
]

async function testEncryption() {
  try {
    testResult.value = null
    const testKey = await generateEncryptionKey()
    const cryptoKey = await importEncryptionKey(testKey)

    const plaintext = '这是一条敏感的测试数据'
    const encrypted = await encryptValue(cryptoKey, plaintext)
    const decrypted = await decryptValue(cryptoKey, encrypted)

    const passed = plaintext === decrypted

    testResult.value = {
      passed,
      message: passed
        ? `✅ AES-GCM 加密验证通过: "${plaintext}" → 密文(${encrypted.data.length}字符) → 解密成功`
        : '❌ 解密结果不匹配'
    }

    message.success(passed ? '加密自测通过！' : '加密自测失败')
  } catch (e) {
    testResult.value = {
      passed: false,
      message: `❌ 测试出错: ${e}`
    }
  }
}

function toggleEncryption() {
  if (isEncrypted.value) {
    userStore.disableEncryption()
    message.info('已临时禁用加密，新数据将以明文存储')
  } else {
    userStore.initEncryption()
    message.success('已启用透明加密')
  }
}
</script>
