# Test Plan — site + dashboard with the Laravel API

> A checklist to run on the **Vercel deployment connected to the API** (not `localhost`). Tick `[x]` as you go; write what went wrong under the item, with the device and the time.
> Updated: 2026-11-15. When an area switches from the browser draft to the API (D7), its section moves from "draft" to "API" and gets tested again.

## What's on the API now

| Area | Dashboard saves to | The site reads from |
|---|---|---|
| Login / logout | API ✅ | — |
| Categories, products, best sellers, their photos | API ✅ | API ✅ |
| Offers (section, list, photos) | API (D7d, once merged) | API (D7d, once merged) |
| Banner, reviews, hero, «من نحن», restaurant info, ordering | this browser only (draft) | mock data |

So for now, the menu area (and offers once D7d is merged) can be tested end to end. The others: test the dashboard screens, but their changes won't reach customers yet.

**D7d offers, first run on staging:** in the dashboard, switch an offer off and on, move one, edit one (title, badge removed), add one with a photo, remove the «العروض» card photo, switch the section off and on, delete one; after each, check the home and the menu on another device.

## Devices

Run the customer parts on at least: an Android phone (Chrome), an iPhone (Safari), and a desktop browser. Dashboard: a phone and a desktop. One test with the phone on mobile data (not Wi-Fi).

---

## A. Dashboard login and session

- [ ] Right username and password → the dashboard home.
- [ ] Wrong password → one Arabic message under the form (it doesn't say which field was wrong).
- [ ] 5 wrong tries in a row → «استنى دقيقة»-style message; works again after a minute.
- [ ] «خروج» → back to the login; the browser's Back button doesn't show the dashboard again.
- [ ] Open a dashboard link while signed out (e.g. `/dashboard/menu`) → login → you land on that page.
- [ ] Signed in on two devices at once: both work.

## B. Menu area (on the API)

For each step: save in the dashboard, then open the site **on another device** and check the change is there (within a few seconds).

- [ ] Change a price from the list → the menu and the item page show it.
- [ ] Mark a product unavailable → it shows dimmed on the menu, can't be added to the cart.
- [ ] Add a product with a photo **from a phone** (once from an iPhone: Safari sends PNG) → shows in its category with the photo.
- [ ] Edit it: name, description, ingredients, sizes (add one, remove one) → saved; sizes and their prices right in the item page.
- [ ] Delete it → gone from the menu; its old link opens the "not found" page.
- [ ] Add a category, rename it, move it up/down → the menu order follows.
- [ ] Delete a category that still has products → refused with a clear Arabic message.
- [ ] Category card photo: set, change, remove.
- [ ] Best sellers: add one, remove one (try «تراجع»), move one → the home slider follows.
- [ ] A big photo (> 5 MB) → a clear «الصورة كبيرة» message, nothing breaks.
- [ ] Two edits quickly in a row (double tap «احفظ») → saved once.

## C. Customer journey (phone)

- [ ] Home loads; the spit turns (or shows the photo with reduced motion); best sellers, offers, reviews, footer.
- [ ] Menu: search, section list, category cards, open an item, pick a size, add to cart.
- [ ] Cart: change quantities, item notes, order note, remove an item.
- [ ] **Delivery order:** name, phone, address → WhatsApp opens to the **delivery number**, the message has the order number `#…`, items, sizes, fee and total right.
- [ ] **Table order:** pick branch + table → WhatsApp opens to **that branch's floor staff number**; no delivery fee.
- [ ] After sending: the cart is empty, «رجّع الطلب» brings it back.
- [ ] Share an item on WhatsApp → the link preview shows the dish image and name.
- [ ] Table QR (after the domain): scan a printed code → the menu greets «طاولة N · الفرع», checkout has the table filled in.

## D. When things go wrong

- [ ] Slow network (DevTools → Network → "Slow 4G"): pages show their loading state, nothing jumps or breaks.
- [ ] Phone offline in the dashboard, then «احفظ» → «ما في إنترنت»-style message; the form keeps what you typed.
- [ ] Session ended mid-edit (sign out on another tab, then save here) → sent to the login, then back to the page.
- [ ] The API down (ask the backend developer to stop staging for 5 minutes): the menu keeps showing the last good copy; a page never seen before shows «القائمة مش متاحة هلق، اطلب على الواتساب».

## E. Dashboard areas still on the draft

Test the screens (forms, errors, previews, 360px); remember changes stay in this browser.

- [ ] Offers: add / edit / on-off / move / delete; section switch and texts.
- [ ] Banner: add a slide with a button to a category, a product, the offers.
- [ ] Reviews: add / edit / shown-hidden / move / delete.
- [ ] Hero and «من نحن»: texts, highlights («ميّز»), icons, photo.
- [ ] Restaurant info: phones (Arabic digits), branches, hours, social links.
- [ ] Ordering: delivery fee and number, tables per branch, message texts with the preview.
- [ ] QR codes: print preview (2 tables per page, menu poster).

## F. After each area switches to the API (D7d…)

Repeat its section in **E**, then check the change on the site from another device, the same way as **B**.

## G. Every release

- [ ] `npm run lint`, `npm run typecheck`, `npm run build` pass.
- [ ] 360px phone width: no sideways scroll on any page.
- [ ] Keyboard only: every button and field reachable, focus visible.
- [ ] Reduced motion on (OS setting): no spinning spit, no big animations.
- [ ] Google: the home and an item page pass the Rich Results Test (restaurant data).
