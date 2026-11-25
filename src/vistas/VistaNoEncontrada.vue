<script setup>
import { useRouter } from 'vue-router'
import { Compass, ArrowLeft } from 'lucide-vue-next'
import BotonBase from '@/componentes/comun/BotonBase.vue'
import { useAuthStore } from '@/estado/estadoAutenticacion'

const router = useRouter()
const auth = useAuthStore()
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center px-4 text-center">
    <span class="grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-brand-600"><Compass class="h-8 w-8" /></span>
    <p class="mt-6 text-sm font-semibold text-brand-700">Error 404</p>
    <h1 class="mt-1 text-3xl font-extrabold tracking-tight">Página no encontrada</h1>
    <p class="mt-2 max-w-sm text-sm text-muted">La dirección que buscas no existe o fue movida.</p>
    <BotonBase class="mt-8" :icon="ArrowLeft" @click="router.push(auth.isAuthenticated ? auth.homeRoute : { name: 'login' })">
      Volver al inicio
    </BotonBase>
  </div>
</template>
