import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createFileRoute } from '@tanstack/react-router'
import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { env } from 'cloudflare:workers'
import { z } from 'zod'

import { todos } from '@/db/schema/schema'

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

const createTodoSchema = z.object({
  title: z.string().min(1).max(255),
})

const updateTodoSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  completed: z.boolean().optional(),
})

const app = new Hono()
  .basePath('/api/todos')
  .get('/', async (c) => {
    const db = drizzle(env.DB)
    const result = await db.select().from(todos).all()
    return c.json(result)
  })
  .get('/:id', zValidator('param', idParamSchema), async (c) => {
    const { id } = c.req.valid('param')

    const db = drizzle(env.DB)
    const result = await db.select().from(todos).where(eq(todos.id, id)).get()
    if (!result) {
      return c.json({ error: 'Todo not found' }, 404)
    }
    return c.json(result)
  })
  .post('/', zValidator('json', createTodoSchema), async (c) => {
    const data = c.req.valid('json')

    const db = drizzle(env.DB)
    const result = await db.insert(todos).values(data).returning().get()
    return c.json(result, 201)
  })
  .patch('/:id', zValidator('param', idParamSchema), zValidator('json', updateTodoSchema), async (c) => {
    const { id } = c.req.valid('param')
    const data = c.req.valid('json')

    const db = drizzle(env.DB)
    const existing = await db.select().from(todos).where(eq(todos.id, id)).get()
    if (!existing) {
      return c.json({ error: 'Todo not found' }, 404)
    }

    const result = await db
      .update(todos)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(todos.id, id))
      .returning()
      .get()
    return c.json(result)
  })
  .delete('/:id', zValidator('param', idParamSchema), async (c) => {
    const { id } = c.req.valid('param')

    const db = drizzle(env.DB)
    const existing = await db.select().from(todos).where(eq(todos.id, id)).get()
    if (!existing) {
      return c.json({ error: 'Todo not found' }, 404)
    }

    await db.delete(todos).where(eq(todos.id, id))
    return c.json({ message: 'Deleted' })
  })

export type AppType = typeof app

export const Route = createFileRoute('/api/todos/$')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return await app.fetch(request)
      },
      POST: async ({ request }: { request: Request }) => {
        return await app.fetch(request)
      },
      PATCH: async ({ request }: { request: Request }) => {
        return await app.fetch(request)
      },
      DELETE: async ({ request }: { request: Request }) => {
        return await app.fetch(request)
      },
    },
  },
})
