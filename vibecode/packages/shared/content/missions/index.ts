// VibeCode — Conteúdo Estático das Missões
// Importa os JSONs e exporta como objetos Mission tipados

import type { Mission } from '../../types'
import m01Data from './m01.json'
import m02Data from './m02.json'
import m03Data from './m03.json'

export const MISSION_M01: Mission = m01Data as Mission
export const MISSION_M02: Mission = m02Data as Mission
export const MISSION_M03: Mission = m03Data as Mission

export const STATIC_MISSIONS: Mission[] = [MISSION_M01, MISSION_M02, MISSION_M03]

export function getStaticMission(id: string): Mission | undefined {
  return STATIC_MISSIONS.find((m) => m.id === id)
}
