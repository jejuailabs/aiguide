"use client"

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { app } from "./firebase-client"

export const MAX_POSTER_BYTES = 5 * 1024 * 1024 // 5MB

/**
 * 포스터 이미지를 Firebase Storage에 업로드하고 공개 URL을 돌려준다.
 * Storage가 비활성화되어 있거나 규칙에 막히면 예외를 던지므로,
 * 호출부에서 URL 직접 입력으로 폴백할 수 있게 한다.
 */
export async function uploadPoster(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다")
  }
  if (file.size > MAX_POSTER_BYTES) {
    throw new Error("이미지 크기는 5MB 이하만 가능합니다")
  }

  const storage = getStorage(app)
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`
  const storageRef = ref(storage, `posters/${name}`)

  await uploadBytes(storageRef, file, { contentType: file.type })
  return await getDownloadURL(storageRef)
}
