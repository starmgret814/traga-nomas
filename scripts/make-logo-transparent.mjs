import sharp from "sharp"

const SRC = "public/logo-traga-nomas.png"
const OUT = "public/logo-traga-nomas.png"

const img = sharp(SRC).ensureAlpha()
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info

// Flood-fill from the edges: only the outer white background becomes
// transparent, so any near-white pixels inside the artwork are preserved.
const total = width * height
const visited = new Uint8Array(total)
const isWhite = (i) => {
  const o = i * channels
  return data[o] > 235 && data[o + 1] > 235 && data[o + 2] > 235
}

const stack = []
for (let x = 0; x < width; x++) {
  stack.push(x) // top row
  stack.push((height - 1) * width + x) // bottom row
}
for (let y = 0; y < height; y++) {
  stack.push(y * width) // left col
  stack.push(y * width + (width - 1)) // right col
}

while (stack.length) {
  const i = stack.pop()
  if (i < 0 || i >= total || visited[i]) continue
  visited[i] = 1
  if (!isWhite(i)) continue
  data[i * channels + 3] = 0 // make transparent
  const x = i % width
  const y = (i - x) / width
  if (x > 0) stack.push(i - 1)
  if (x < width - 1) stack.push(i + 1)
  if (y > 0) stack.push(i - width)
  if (y < height - 1) stack.push(i + width)
}

await sharp(data, { raw: { width, height, channels } })
  .png()
  .toFile(OUT + ".tmp")

console.log("done")
