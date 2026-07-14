import Button from "@/components/base/Button";
import EarlySupportBadge from "@/components/common/Badge/EarlySupportBadge";
import FeedbackButton from "@/components/features/Landing/FeedbackButton";
import { createMetadata } from "@/config/metadata.config";

export const metadata = createMetadata({
  title: "Landing",
  description:
    "Meet teammates faster with Player2. Build your profile, browse LFG posts, and connect with gamers.",
  path: "/landing",
  keywords: ["landing page", "gaming community", "find group"],
});

const Heading = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center">
    <h2 className="font-bold text-white text-xl">{title}</h2>
    <span className="bg-[#3E8BFF] h-1 w-8" />
  </div>
);

export default function LandingPage() {
  return (
    <>
      <div dir="rtl" className="min-h-screen">
        <section className="relative flex-col items-center justify-between left-1/2 flex min-h-60 width-screen max-w-none -translate-x-1/2 overflow-hidden bg-background p-6 text-center">
          <div className="absolute inset-0 bg-[url('/images/hero-landing.png')] bg-cover bg-bottom" />
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />

          <div />

          <div className="z-10">
            <h1
              className="glitch layers font-melting inline-block text-[clamp(2.75rem,14vw,2.5rem)] font-medium uppercase leading-none tracking-[0.08em] text-white drop-shadow-[0_1px_8px_rgba(255,255,255,0.75)] sm:tracking-[0.18em]"
              data-text="PLAYER2"
              aria-label="PLAYER2"
            >
              <span>PLAYER2</span>
            </h1>
          </div>

          <div className="flex flex-col gap-2 z-10">
            <h2 className="text-sm font-medium text-white">
              Find Your Player Two
            </h2>
            <p className="text-[10px] font-normal text-white">
              Real Players. No Randoms
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-8 py-8 px-4">
          <Heading title="Player2 چیه؟" />

          <div className="text-white text-sm font-medium">
            <p className="leading-8">
              Player2 یه پلتفرم رایگانه برای پیدا کردن همبازی واقعی.
            </p>
            <p className="leading-8">
              جایی که گیمرها راحت‌تر همدیگه رو پیدا می‌کنن ، پروفایل حرفه‌ای
              میسازن ، تیم می‌سازن و کنار هم بازی می‌کنن بدون شلوغی و حاشیه
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-8 py-8 px-4 bg-[#131419]">
          <div className="flex items-center gap-4">
            <div className="w-20 flex items-center justify-center">
              <img
                src="/images/controller.svg"
                alt="controller"
                className="w-12 h-12"
              />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-medium text-xl text-white">همبازی واقعی</h3>
              <p className="font-medium text-sm text-white">
                نه رندوم، نه سمی ، همبازی‌هایی که به سبک، هدف و لِولت می‌خورن
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 flex items-center justify-center">
              <img src="/images/coins.svg" alt="coin" className="w-12 h-12" />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-medium text-xl text-white">کاملا رایگان</h3>
              <p className="font-medium text-sm text-white">
                بدون اشتراک ، بدون پرداخت پنهان فقط بازی کن و لذت ببر
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 flex items-center justify-center">
              <img src="/images/quick.svg" alt="quick" className="w-12 h-12" />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-medium text-xl text-white">سریع و ساده</h3>
              <p className="font-medium text-sm text-white">
                درخواست بازیتو ثبت کن و منتظر پیام همبازیت باش و لذت ببرید از
                بازی
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-8 py-8 px-4">
          <div className="flex items-center justify-center">
            <img src="/images/map.svg" alt="map" className="w-12 h-12" />
          </div>

          <Heading title="چشم‌انداز Player2" />

          <div className="text-white text-sm font-medium">
            <p className="leading-8">
              Player2 توسط گیمرهای ایرانی ساخته شده و از ایران شروع کرده. هدف ما
              اینه که با حمایت شما، قدم‌به‌قدم به یک پلتفرم جهانی تبدیل بشیم.
            </p>
            <p className="leading-8">
              ما می‌خوایم Player2 جایی باشه که هر گیمر، یک پروفایل واقعی و قابل
              اعتماد داشته باشه؛ محوری برای همبازی پیدا کردن، تیم ساختن و رشد
              داخل دنیای گیم.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-8 py-8 px-4 bg-[#131419]">
          <div className="flex items-center justify-center">
            <EarlySupportBadge />
          </div>

          <Heading title="Early Supporter Badge" />

          <div className="text-white text-sm font-medium">
            <p className="leading-8">Player2 تازه شروع مسیرشه.</p>
            <p className="leading-8">
              همه کاربرهایی که از روزهای اول کنار ما هستن، بدج لیمیتد Early
              Supporter دریافت می‌کنن.
            </p>
            <p className="leading-8">
              این بدج نشونه‌ی حضور شما در شروع Player2 هست که Rare خواهد بود و
              در آینده دیگه هیچ‌وقت ارائه نمی‌شه.
            </p>
          </div>
        </section>
        <section className="h-20 w-full" />

        <section className="flex gap-4 p-4 bg-[#1E2129CC] backdrop-blur-xs sticky bottom-14 left-0 w-full">
          <FeedbackButton />

          <Button fullWidth className="bg-[#252932] text-white">
            Donate
          </Button>
        </section>
      </div>
    </>
  );
}
