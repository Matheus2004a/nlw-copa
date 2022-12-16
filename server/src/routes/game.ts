import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function gameRoutes(fastify: FastifyInstance) {
    fastify.get("/pools/:id/games", {
        onRequest: [authenticate]
    }, async (req) => {
        const getPoolsParams = z.object({
            id: z.string()
        })

        const { id } = getPoolsParams.parse(req.params)

        /* Precisa do id do bolão pra verificar  */

        const games = await prisma.game.findMany({
            orderBy: {
                date: "desc"
            },
            // Um jogo só poderá ter um palpite do mesmo usuário
            include: {
                guesses: {
                    where: {
                        participant: {
                            userId: req.user.sub,
                            poolId: id
                        }
                    }
                }
            }
        })

        /* Ao invés de retornar um array de palpites vazio, retornará apenas um palpite, podendo ele ser undefined (caso o usuário não tenha feito um) ou não */
        return {
            games: games.map(game => {
                return {
                    ...game,
                    guess: game.guesses.length > 0 ? game.guesses[0] : null,
                    guesses: undefined
                }
            })
        }
    })
}