export default function AnnouncementBar() {
  return (
    <div className="bg-stone-800 text-white text-center py-2 overflow-hidden whitespace-nowrap fixed top-0 left-0 right-0 z-50 max-w-[100vw]">
      <div className="inline-block animate-marquee">
        <span className="mx-8">
          This Month Only: Enjoy 20% off your first hair order!
        </span>
        <span className="mx-8">
          This Month Only: Enjoy 20% off your first hair order!
        </span>
        <span className="mx-8">
          This Month Only: Enjoy 20% off your first hair order!
        </span>
      </div>
    </div>
  );
}
