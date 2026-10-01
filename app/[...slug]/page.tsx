export { default } from '@/app/page'

export function generateStaticParams() {
  return [{ slug: ['login'] }, { slug: ['dashboard'] }, { slug: ['syllabus'] }, { slug: ['faculty'] }, { slug: ['visualize', 'bfs'] }, { slug: ['quiz', 'bfs'] }, { slug: ['code', 'bfs-code'] }]
}

export const dynamicParams = true
