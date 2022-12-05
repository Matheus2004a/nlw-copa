import Image from "next/image"
import appPreviewImg from "../assets/preview-nlw-copa.png"
import logoImg from "../assets/logo.svg"
import usersAvatar from "../assets/avatars.png"
import iconCheck from "../assets/icon-check.svg"
import { api } from "../lib/axios"
import { useState } from "react"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
interface HomeProps {
  poolCount: number,
  guessesCount: number,
  usersCount: number
}

export default function Home(props: HomeProps) {
  const [poolTitle, setPoolTitle] = useState("")

  async function createPool(event: FormData) {
    event.preventDefault()
    const poolTitleIsEmpty = poolTitle === "" || poolTitle === null

    try {
      if (poolTitleIsEmpty) throw new Error("Preencha o nome do seu bolão")

      const response = await api.post("/pools", {
        title: poolTitle
      })

      const { code } = response.data
      await navigator.clipboard.writeText(code)

      toast.success("Bolão criado com sucesso. Código copiado para área de transferência", {
        theme: "colored",
        position: "top-right"
      })
    } catch (error) {
      toast.error(error.message, {
        theme: "colored",
        "position": "top-right"
      })
    }

    setPoolTitle("")
  }

  return (
    <div className="max-w-[1124px] h-screen mx-auto grid grid-cols-2 items-center gap-28">
      <main>
        <ToastContainer />

        <Image src={logoImg} alt="logo-nlw-copa" />

        <h1 className="mt-14 text-white text-5xl font-bold leading-tight">
          Crie seu próprio bolão da copa e compartilhe entre amigos!
        </h1>

        <div className="mt-10 flex items-center gap-2">
          <Image src={usersAvatar} alt="" quality={100} />
          <strong className="text-gray-100 text-xl">
            <span className="text-ignite-500">+{props.usersCount}</span>
            pessoas já estão usando
          </strong>
        </div>

        <form onSubmit={createPool} className="mt-10 flex gap-2">
          <input
            className="flex-1 px-6 py-4 rounded bg-gray-800 border border-gray-600 text-sm text-gray-100 caret-gray-100"
            type="text"
            placeholder="Qual nome do seu bolão?"
            onChange={e => setPoolTitle(e.target.value)}
            value={poolTitle}
          />
          <button
            className="bg-yellow-500 px-6 py-4 rounded text-gray-900 font-bold text-sm uppercase hover:bg-yellow-700"
            type="submit">
            Criar meu bolão
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-300 leading-relaxed">
          Após criar seu bolão, você receberá um código único que poderá usar para convidar outras pessoas 🚀
        </p>

        <section className="mt-10 pt-10 border-t border-gray-600 flex justify-between">
          <div className="flex items-center gap-6">
            <Image src={iconCheck} alt="" />
            <p className="flex flex-col">
              <span className="font-bold text-2xl text-gray-100">+{props.poolCount}</span>
              <span className="text-gray-100">Bolões criados</span>
            </p>
          </div>

          <div className="w-px h-14 bg-gray-600" />

          <div className="flex items-center gap-6">
            <Image src={iconCheck} alt="" />
            <p className="flex flex-col">
              <span className="font-bold text-2xl text-gray-100">+{props.guessesCount}</span>
              <span className="text-gray-100">Palpites enviados</span>
            </p>
          </div>
        </section>
      </main>

      <Image
        src={appPreviewImg}
        alt="Two phones display a mobile application preview of NLW Copa"
        quality={100}
      />
    </div>
  )
}

export const getServerSideProps = async () => {
  const [poolData, guessesData, usersData] = await Promise.all([
    api.get("pools/count"),
    api.get("guesses/count"),
    api.get("users/count")
  ])

  return {
    props: {
      poolCount: poolData.data.count,
      guessesCount: guessesData.data.count,
      usersCount: usersData.data.count
    }
  }
}