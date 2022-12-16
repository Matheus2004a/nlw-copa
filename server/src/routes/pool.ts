import { FastifyInstance } from "fastify";
import { z } from "zod"
import ShortUniqueId from "short-unique-id"
import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function poolsRoutes(fastify: FastifyInstance) {
    fastify.get("/pools/count", async () => {
        const count = await prisma.pool.count()
        return { count }
    })

    fastify.post("/pools", async (req, res) => {
        const createPoolBody = z.object({
            title: z.string()
        })

        // Ao afirmar que o title já era uma string, ao usar o parse já foi entendido que o title já existia
        const { title } = createPoolBody.parse(req.body)
        const generateId = new ShortUniqueId({ length: 6 })
        const code = String(generateId()).toUpperCase()

        try {
            await req.jwtVerify()

            await prisma.pool.create({
                data: {
                    title,
                    code,
                    ownerId: req.user.sub,

                    participants: {
                        create: {
                            userId: req.user.sub
                        }
                    }
                }
            })
        } catch {
            await prisma.pool.create({
                data: {
                    title,
                    code
                }
            })
        }

        return res.status(201).send({ code })
    })

    fastify.post("/pools/join", {
        onRequest: [authenticate]
    }, async (req, res) => {
        const joinPoolBody = z.object({
            code: z.string()
        })

        const { code } = joinPoolBody.parse(req.body)

        const pool = await prisma.pool.findUnique({
            where: {
                code
            },
            // Verifica se o usuário logado que está tentando entrar em um bolão, já não está participando deste
            include: {
                participants: {
                    where: {
                        userId: req.user.sub
                    }
                }
            }
        })

        if (!pool) {
            return res.status(400).send({
                message: "Pool not found"
            })
        }

        if (pool.participants.length > 0) {
            return res.status(400).send({
                message: "You already this pool"
            })
        }

        // Se um bolão criado não tiver dono, o 1º usuário que entrar nele será o dono
        if (!pool.ownerId) {
            await prisma.pool.update({
                where: {
                    id: pool.id
                },
                data: {
                    ownerId: req.user.sub
                }
            })
        }

        await prisma.participant.create({
            data: {
                poolId: pool.id,
                userId: req.user.sub
            }
        })

        return res.status(201).send()
    })

    fastify.get("/pools", {
        onRequest: [authenticate]
    }, async (req) => {
        const pools = await prisma.pool.findMany({
            where: {
                participants: {
                    some: {
                        userId: req.user.sub
                    }
                }
            },
            include: {
                _count: {
                    select: {
                        participants: true
                    }
                },
                participants: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                avatarUrl: true
                            }
                        }
                    },
                    take: 4
                },
                owner: true
            }
        })

        return { pools }
    })

    fastify.get("/pools/:id", {
        onRequest: [authenticate]
    }, async (req) => {
        const getPoolsParams = z.object({
            id: z.string()
        })

        const { id } = getPoolsParams.parse(req.params)

        const pool = await prisma.pool.findUnique({
            where: {
                id
            },
            include: {
                _count: {
                    select: {
                        participants: true
                    }
                },
                participants: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                avatarUrl: true
                            }
                        }
                    },
                    take: 4
                },
                owner: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        return { pool }
    })
}