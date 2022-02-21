import type { NextPage } from 'next'
import Header from '../component/Header'

const style = {
  wrapper: `h-screen max-h-screen h-min-screen w-screen bg-[#2D242F] text-white select-none flex flex-col justify-between`,
}

const Home: NextPage = () => {
  return (
    <div className={style.wrapper}>
      <Header />
    </div>
  )
}

export default Home
