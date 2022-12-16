import Fastify from "fastify"
import cors from "@fastify/cors"
import jwt from "@fastify/jwt"

import { poolsRoutes } from "./routes/pool"
import { userRoutes } from "./routes/user"
import { guessRoutes } from "./routes/guess"
import { gameRoutes } from "./routes/game"
import { authRoutes } from "./routes/auth"

async function start() {
    const fastify = Fastify({
        logger: true
    })

    await fastify.register(cors, {
        origin: true
    })

    // In production the value secret must be a environment variable
    await fastify.register(jwt, {
        secret: "nlw_copa_mobile"
    })

    await fastify.register(poolsRoutes)
    await fastify.register(userRoutes)
    await fastify.register(guessRoutes)
    await fastify.register(gameRoutes)
    await fastify.register(authRoutes)

    await fastify.listen({ port: 3333 })
}

start()