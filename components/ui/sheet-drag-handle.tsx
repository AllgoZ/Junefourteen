/** Visual drag indicator for bottom sheets — the iOS affordance that signals "swipe to dismiss." */
export function SheetDragHandle() {
  return (
    <div className="flex justify-center pt-2.5 pb-1" aria-hidden="true">
      <div className="h-1 w-9 rounded-full bg-border" />
    </div>
  );
}
