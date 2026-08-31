# Finance and Payments: Stripe, GST, and Compliance for AccessArt

**Research date: 31 August 2026.** Pricing and regulation cited below were checked against live sources on this date; Stripe AU pricing changes on 1 October 2026, so re-verify at build time.

## Executive summary

AccessArt can run its entire money flow inside Stripe Connect: consumers pay by card, Stripe splits proceeds to artists and venues via Express accounts, and the platform keeps its commission as an application fee, never touching client funds itself. That structure sidesteps most Australian financial services licensing because Stripe Payments Australia (AFSL 500105) is the regulated money handler. GST is manageable because the platform is only liable for GST on its own commission and fees; unregistered hobbyist artists (under the A$75k threshold) make supplies with no GST, and the electronic distribution platform GST regime does not shift liability for domestic physical goods. The two compliance items most founders miss both apply here: collecting an ABN or a "Statement by a supplier" form from every artist to avoid 47 percent withholding, and the Sharing Economy Reporting Regime (SERR), which from 1 July 2024 requires the platform to report art **rental** transactions (asset hire) to the ATO twice a year, while outright **sales** of artworks are excluded. Weekly A$9 card charges lose about 5 percent to Stripe's fixed fee, so bill in 4-week blocks. The rent-to-own credit should be framed as a conditional discount, not held funds, which keeps it outside escrow and stored-value regulation, subject to legal confirmation.

## 1. Stripe Connect for an Australian marketplace

**Account types and onboarding.** Use Express connected accounts for artists and venues: Stripe hosts the onboarding flow, runs identity verification, gives each artist a lightweight dashboard for payouts, and takes on the marketplace's KYC obligations, updating requirements automatically ([Stripe Connect marketplaces](https://stripe.com/au/connect/marketplaces), [identity verification docs](https://docs.stripe.com/connect/identity-verification)). Express supports both individuals and businesses. For Australia, an artist onboarding as an **individual** supplies name, date of birth, address, ID verification and bank details; a **sole trader or company** additionally supplies business details including an ABN/ACN. Stripe's published flows indicate a hobbyist without an ABN can onboard as an individual; confirm the exact AU field list in test mode before launch, since Stripe periodically updates requirements ([upcoming requirements updates](https://docs.stripe.com/connect/upcoming-requirements-updates)).

**Charge patterns.** Stripe offers three: direct charges, destination charges, and separate charges and transfers ([how charges work](https://docs.stripe.com/connect/charges)). Destination charges suit one buyer paying one connected account, with the platform skimming an `application_fee_amount`. Separate charges and transfers decouple the charge from payouts and let one payment fund transfers to **multiple** connected accounts, which is exactly the artist-plus-venue split on a sale off a café wall ([separate charges and transfers](https://docs.stripe.com/connect/marketplace/tasks/accept-payment/separate-charges-and-transfers), [Cobbleweb charge-type guide](https://www.cobbleweb.co.uk/choose-the-right-stripe-connect-charge-type-for-your-marketplace-business-model/)). Recommendation: use **separate charges and transfers with a `transfer_group`** for sales (transfer to artist, transfer to venue, remainder stays as platform revenue), and either pattern for rent, where only the artist is paid. Note that with these patterns the platform account is debited for Stripe fees, refunds and chargebacks.

**Current AU pricing** (from [stripe.com/au/pricing](https://stripe.com/au/pricing) and [merchant guides](https://merchantcompare.com.au/providers/payment-providers/stripe), checked 31 Aug 2026):

- Domestic cards: 1.75% + A$0.30 per transaction today; Stripe's pricing page advertises a lower 1.7% + A$0.30 from 1 October 2026, timed with the RBA's interchange cuts ([Boldrails on the surcharge ban and rate changes](https://boldrails.com/blog/best-payment-gateways-australia)). International cards are materially higher (the page lists 3.5% + A$0.30 with a further change scheduled 1 April 2027) plus 2% currency conversion.
- GST on fees: the current pricing page states card and BECS fees include GST; some guides describe GST as added on top of quoted rates. Verify in the dashboard; either way a GST-registered platform claims it back as an input tax credit.
- BECS Direct Debit and PayTo: 1% + A$0.30, capped at A$3.50. Worth offering for rent once trust is established; far cheaper than cards for recurring charges.
- Disputes: A$25 each (and A$25 to counter manually under the new schedule).
- Payouts to Australian bank accounts: free on standard settlement; instant payouts cost 1.5% (minimum A$0.50).
- Connect: when the platform sets its own pricing for connected accounts, A$2 per monthly active account plus 0.25% + A$0.25 per payout sent; cross-border payouts from 0.25% ([Connect pricing](https://stripe.com/au/connect/pricing)). With all-AU artists and venues, cross-border fees should not arise.
- Stripe Billing (if used for subscriptions): 0.7% of billing volume, which includes Smart Retries and dunning ([Stripe pricing](https://stripe.com/pricing), [UsageBox analysis](https://usagebox.com/articles/stripe-billing-fees-2026-the-07-percent-math)).

**Weekly recurring rent: subscriptions vs off-session PaymentIntents.** Two viable builds ([recurring payments docs](https://docs.stripe.com/recurring-payments)): (a) Stripe Billing subscriptions with a weekly or 4-weekly interval, which gives you invoices, proration on swaps, Smart Retries and dunning emails out of the box for 0.7% of volume; (b) save the card with a SetupIntent and run your own scheduler firing off-session PaymentIntents, which avoids the 0.7% fee and gives full control over swap timing, pauses and the rent-credit ledger, but means building retry and dunning logic yourself. For a small team, start with Billing subscriptions (one subscription per active rental, swap the price/product on artwork swap) and revisit if the 0.7% matters at scale. Either way, terms must record the customer's consent to off-session charges.

## 2. GST for the marketplace

**Who is liable.** GST liability sits with the supplier of each thing supplied. Australia's electronic distribution platform (EDP) rules shift GST liability to the platform only for imported services and digital products sold to Australian consumers and for low-value imported goods; they do **not** apply to domestic sales of physical goods by Australian sellers ([ATO EDP operator guidance](https://www.ato.gov.au/businesses-and-organisations/international-tax-for-business/gst-for-non-resident-businesses/how-to-charge-gst/if-you-are-an-edp-operator), [Stripe marketplace tax guide](https://stripe.com/guides/understanding-the-tax-obligations-of-marketplaces-in-australia)). So for AccessArt's domestic physical art, the artist is the supplier of the artwork rental and sale, provided the terms make the platform an **agent**, not a reseller. If the platform contracted as principal (renting art from artists and re-renting it), the platform would owe GST on the full rent. Draft terms explicitly on the agency model (see GSTR 2000/37 on agency relationships via the [ATO legal database](https://www.ato.gov.au/law/view/document?docid=TXR/TR20051/NAT/ATO/00001)).

**Unregistered artists.** Most emerging artists will be under the A$75,000 GST registration threshold and unregistered. Their rentals and sales then carry no GST at all, and the platform must not add GST to their prices or issue tax invoices for them. Rental income and sale income are treated the same way: both are taxable supplies if and only if the supplier is registered or required to be registered.

**GST on the platform's own charges.** Once AccessArt's own turnover passes A$75k (or it registers voluntarily, which it should from day one to claim input credits on AWS and Stripe fees), 10% GST applies to its commission on rent and sales, to venue service fees, and to consumer-facing fees such as damage waiver and delivery. Decide whether headline splits (60/40, 20%) are GST-inclusive; with unregistered artists who cannot claim input credits, quoting commission GST-inclusive is cleaner.

**Invoicing on behalf of artists.** Recipient created tax invoices (RCTIs) require both parties to be GST registered plus a written RCTI agreement, and are only permitted for classes of transactions the ATO has determined (see [LI 2023/20](https://www.ato.gov.au/law/view/view.htm?docid=%22ops/li202320/00001%22), which includes large recipients with A$20m+ turnover; an early-stage platform likely does not qualify) ([LegalVision RCTI guide](https://legalvision.com.au/recipient-created-tax-invoice/)). The practical route: for unregistered artists, issue plain payment statements (no GST, no tax invoice); for the minority of GST-registered artists, generate tax invoices **as their agent** under the agency provisions, which is distinct from an RCTI, and issue the platform's own tax invoice for its commission.

## 3. Paying hobbyist artists

**No-ABN withholding.** When a business pays a supplier who does not quote an ABN, it must generally withhold 47% and remit it to the ATO ([Sprintlaw on no-ABN withholding](https://sprintlaw.com.au/articles/no-abn-withholding-in-australia-what-to-do-and-avoid-penalties/)). Exceptions include: the supply is made in the course of a private recreational pursuit or hobby, the supplier is not carrying on an enterprise, the payment is A$75 or less (excluding GST), or the supplier is under 18 and paid A$350 or less a week ([ATO: Statement by a supplier](https://www.ato.gov.au/forms-and-instructions/statement-by-supplier-not-quoting-an-abn)).

**Statement by a supplier.** A hobbyist artist avoids the 47% withholding by giving the platform the ATO form "Statement by a supplier not quoting an ABN" (NAT 3346), declaring the supply is a hobby or that they are not entitled to an ABN. Collect it at onboarding for every artist without an ABN, store it for five years, and withhold if you have reasonable grounds to believe the statement is false. Bake this into the Express onboarding flow as a platform-side step, since Stripe does not collect it.

**When hobby becomes business.** Under [TR 2005/1](https://www.ato.gov.au/law/view/document?docid=TXR/TR20051/NAT/ATO/00001), an artist is carrying on a business when their activity is directed to commercial ends: intention to profit, repetition, scale, business-like records. Regular listings and recurring rental income on a marketplace push toward "business", at which point income is assessable, an ABN is appropriate, and a hobby statement is no longer valid. Prompt artists annually to reconfirm status; NAVA's guidance for artists is a useful reference ([NAVA on artists' income tax](https://visualarts.net.au/advocacy/tax/artists-income-tax/)).

**What the platform must report.** TPRS (taxable payments reporting) covers only building and construction, cleaning, couriers, road freight, IT and security services, so it does not apply. SERR does. From 1 July 2023 SERR covered ride-sourcing and short-term accommodation; from **1 July 2024 it extended to all other reportable transactions through EDPs, including hire of assets** ([ATO SERR overview](https://www.ato.gov.au/businesses-and-organisations/preparing-lodging-and-paying/third-party-reporting/sharing-economy-reporting-regime), [PwC alert](https://www.pwc.com.au/tax/tax-alerts/reporting-regime-for-online-marketplaces-update-2024.html)). Be precise here: **art rentals are asset hire and are reportable; outright sales of goods (title transfers) are expressly excluded from SERR** ([RSM on the expanded regime](https://www.rsm.global/australia/insights/tax-insights/get-ahead-expanded-sharing-economy-reporting-regime), [LegalVision SERR guide](https://legalvision.com.au/serr/)). So AccessArt must lodge SERR reports for rental transactions twice yearly (by 31 January and 31 July), covering artist identity (name, DOB, address, ABN if held, bank details) and gross transaction values. Design the data model to capture these fields from day one.

## 4. Holding money and regulation

Under the Corporations Act, issuing a facility through which people make non-cash payments is a financial product, so operating your own pay-in/pay-out flow can require an AFSL unless an exemption applies (single-payee facilities under s763D, ASIC's low-value relief, and similar) ([Hamilton Locke on payments licensing](https://hamiltonlocke.com.au/licensing-essentials-navigating-the-payments-licensing-maze/), [LegalVision on NCP facilities](https://legalvision.com.au/non-cash-payment-facilities-franchises/)).

The Stripe Connect structure is how marketplaces avoid this. The buyer's payment is processed by Stripe Payments Australia Pty Ltd, holder of AFSL 500105 ([AFSL register entry](https://search-afsl.com/Stripe%20Payments%20Australia%20Pty%20ltd/afs-licensee/500105/), [Stripe Services Agreement AU](https://stripe.com/en-au/legal/ssa)). Funds settle inside Stripe; artists and venues are paid by Stripe into their own bank accounts; the platform receives only its commission. AccessArt never holds client money, keeps no trust account, and is not the issuer of the payment facility. Two caveats: (1) keep it that way, meaning never route artist payouts through AccessArt's operating bank account; (2) Australia's payments licensing reform will replace the NCP concept with a "payment functions" regime requiring PSP licensing, with tranche-one draft legislation out in 2025 and implementation rolling through 2026-27; marketplaces using a licensed processor are expected to remain outside it, but track the final carve-outs ([Allens on tranche one](https://www.allens.com.au/insights-news/insights/2025/10/first-tranche-of-payments-licensing-reforms-what-you-need-to-know/), [Gadens](https://www.gadens.com/legal-insights/australian-payments-systems-reform-seven-proposed-payment-functions-to-replace-non-cash-licensing-regime/)).

**Rent-to-own credit ledger.** Framing the accrued rental credit as a **conditional discount off a future purchase price** is the right structure: no customer funds are held, nothing is redeemable for cash, and there is no stored value, so it should fall outside escrow, client-money and stored-value-facility regulation. It is a promotional liability on AccessArt's books, not money owed. Keep the terms explicit: credit is non-transferable, non-refundable, applies only to purchase of eligible works, and expires on defined events. This framing is sound in principle but was not verified against a specific ASIC ruling; have a lawyer confirm it, especially once the new payments legislation lands.

## 5. Rental money mechanics

**Deposits vs damage waiver.** A security deposit or bond is held money returned if obligations are met; if you take one, the ACCC requires you to specify in writing the circumstances of forfeiture, and to give an itemised bill and a chance to dispute before charging a card for damage ([ACCC rental industry guide](https://www.accc.gov.au/system/files/Rental%20cars%20-%20an%20industry%20guide%20to%20the%20Australian%20Consumer%20Law.pdf), [Sprintlaw on security deposits](https://sprintlaw.com.au/articles/security-deposits-explained-essential-australian-business-guide/)). Card pre-authorisation holds expire after roughly seven days, so a standing hold is impractical for multi-month rentals. Rental businesses (car hire, furniture hire) therefore typically charge a small non-refundable **damage waiver fee** instead, the model AccessArt should copy: a dollar or two per week that caps the renter's liability for accidental damage. Waiver terms must not be sold misleadingly and cannot exclude ACL rights.

**Failed payments.** With Stripe Billing, Smart Retries plus dunning emails recover a majority of failed recurring payments automatically ([Stripe recurring payments](https://docs.stripe.com/recurring-payments)); pair this with product rules: pause swap rights on arrears, terminate the rental and schedule artwork retrieval after a defined arrears period, and keep the right to charge the saved card for unpaid rent in the terms.

**Chargebacks.** Disputes cost A$25 and, under destination or separate charges, hit the platform's balance. Defend with delivery/installation photos, the signed rental agreement, swap logs and a clear statement descriptor (e.g. ACCESSART RENT) so weekly charges are recognisable. Ongoing possession of a physical artwork is strong evidence against "product not received" claims.

**Refunds under the ACL.** Consumer guarantees (acceptable quality, match description) apply to art sold, including after a rental period; a major failure entitles the buyer to a refund or replacement, while change of mind does not ([ACCC repair, replace, refund](https://www.accc.gov.au/consumers/problem-with-a-product-or-service-you-bought/repair-replace-refund-cancel)). Having lived with the artwork before buying sharply reduces "not as described" exposure; note in terms that the buyer purchases the specific work they have been renting, in its inspected condition.

## 6. Unit economics: A$900 artwork, A$9/week rent

Assumptions: 60/40 artist/platform rent split (GST-inclusive on the platform side), 20% sale commission, unregistered artist (no GST on their supplies), platform GST-registered, Stripe domestic card rate 1.75% + A$0.30 (fee GST ignored as recoverable), rent billed weekly.

**Per rental month (4 weeks):**

| Line | Amount |
|---|---|
| Gross rent (4 x A$9) | A$36.00 |
| Stripe fees (4 charges x A$0.4575) | (A$1.83) |
| Artist share, 60% | (A$21.60) |
| Platform share, 40%, GST-inclusive | A$14.40 |
| GST remitted on platform share (1/11) | (A$1.31) |
| Damage-waiver allowance reserved (5% of rent) | (A$1.80) |
| **Platform net per rental month** | **A$9.46** |

Lesson: weekly A$9 charges lose 5.1% to Stripe because of the A$0.30 fixed fee. One 4-weekly charge of A$36 costs A$0.93 (2.6%), lifting platform net to about A$10.36. Bill in 4-week blocks. If instead of reserving 5% you charge the renter a separate A$1.50/week waiver fee, that adds about A$5.45/month net of GST but must genuinely fund damage cover.

**Per sale (after 20 rented weeks, assuming 50% of rent paid, A$90, credits toward price, funded by the platform):**

| Line | Amount |
|---|---|
| Sale price | A$900.00 |
| Rent credit applied | (A$90.00) |
| Buyer pays by card | A$810.00 |
| Stripe fee (1.75% + A$0.30) | (A$14.48) |
| Artist paid (80% of price) | (A$720.00) |
| Platform commission (20%), GST-inclusive | A$180.00 |
| GST remitted (1/11 of commission) | (A$16.36) |
| Credit funded from commission | (A$90.00) |
| **Platform net per sale** | **A$59.16** |

Critical design finding: if a venue cut of 10% (A$90) also comes out of the platform's 20%, platform net goes **negative** (about -A$30.84). For venue-wall sales, either reduce the artist share (for example artist 70% / venue 10% / platform 20%, restoring the A$59.16 net), cap the rent credit lower, or share the credit cost pro rata. Set these splits before signing venue agreements. All figures above are arithmetic from stated assumptions, not verified market benchmarks.

## 7. Key takeaways for AccessArt

**(a) Build decisions**

- Use Stripe Connect **Express** accounts for artists and venues; let Stripe own KYC and payout bank details.
- Use **separate charges and transfers with transfer_group** for sales (artist + venue splits); destination charges or the same pattern for rent.
- Bill rent in **4-week blocks** via Stripe Billing subscriptions (Smart Retries and dunning included at 0.7%); model swaps as subscription item changes.
- Keep the rent-to-own credit as a **ledger of conditional discounts** in your own database, never as stored funds; record SERR-required artist identity fields and per-transaction gross values from day one.
- Offer BECS/PayTo (1% capped at A$3.50) as a cheaper rent payment rail later.

**(b) Compliance before launch**

- Register AccessArt for GST voluntarily; charge 10% GST on commissions and fees; quote artist splits GST-inclusive.
- Collect an **ABN or a signed "Statement by a supplier" (NAT 3346)** from every artist at onboarding; withhold 47% if neither is given; re-confirm annually.
- Stand up a **SERR reporting pipeline** for rental transactions (lodgments due 31 January and 31 July); sales are excluded.
- Write terms on the **agency model**: artist is the supplier, platform is agent; include off-session charging consent, damage waiver terms, arrears/retrieval process, and ACL-compliant refund language.
- Do not issue RCTIs; issue payment statements to unregistered artists and agent-issued tax invoices for GST-registered ones.

**(c) Open questions for an accountant or lawyer**

- Confirm the agency (not principal) GST characterisation of rentals and sales, and the GST treatment of the rent credit (discount vs consideration adjustment).
- Confirm the rent-to-own credit and damage waiver fall outside NCP/stored-value regulation, and re-check once the new payment-functions licensing regime is enacted.
- Whether AccessArt needs its own insurance (goods in transit, artworks in venues) versus relying on the damage waiver pool; and state-based fair trading rules for hire agreements in Queensland.

## Sources

- Stripe AU pricing: https://stripe.com/au/pricing
- Stripe Connect pricing: https://stripe.com/au/connect/pricing
- Stripe Connect marketplaces: https://stripe.com/au/connect/marketplaces
- Stripe Connect charge types: https://docs.stripe.com/connect/charges and https://docs.stripe.com/connect/marketplace/tasks/accept-payment/separate-charges-and-transfers
- Stripe identity verification: https://docs.stripe.com/connect/identity-verification
- Stripe recurring payments: https://docs.stripe.com/recurring-payments
- Stripe Billing fee analysis: https://usagebox.com/articles/stripe-billing-fees-2026-the-07-percent-math
- Stripe AU fee guides: https://merchantcompare.com.au/providers/payment-providers/stripe and https://boldrails.com/blog/best-payment-gateways-australia
- ATO, EDP operators and GST: https://www.ato.gov.au/businesses-and-organisations/international-tax-for-business/gst-for-non-resident-businesses/how-to-charge-gst/if-you-are-an-edp-operator
- Stripe guide, marketplace tax obligations in Australia: https://stripe.com/guides/understanding-the-tax-obligations-of-marketplaces-in-australia
- ATO, Statement by a supplier: https://www.ato.gov.au/forms-and-instructions/statement-by-supplier-not-quoting-an-abn
- Sprintlaw, no-ABN withholding: https://sprintlaw.com.au/articles/no-abn-withholding-in-australia-what-to-do-and-avoid-penalties/
- ATO ruling TR 2005/1, professional artists: https://www.ato.gov.au/law/view/document?docid=TXR/TR20051/NAT/ATO/00001
- NAVA, artists' income tax: https://visualarts.net.au/advocacy/tax/artists-income-tax/
- ATO, SERR: https://www.ato.gov.au/businesses-and-organisations/preparing-lodging-and-paying/third-party-reporting/sharing-economy-reporting-regime
- PwC, reporting regime for online marketplaces: https://www.pwc.com.au/tax/tax-alerts/reporting-regime-for-online-marketplaces-update-2024.html
- RSM, expanded SERR: https://www.rsm.global/australia/insights/tax-insights/get-ahead-expanded-sharing-economy-reporting-regime
- LegalVision, SERR: https://legalvision.com.au/serr/
- LegalVision, RCTIs: https://legalvision.com.au/recipient-created-tax-invoice/
- ATO, RCTI determination LI 2023/20: https://www.ato.gov.au/law/view/view.htm?docid=%22ops/li202320/00001%22
- Hamilton Locke, payments licensing: https://hamiltonlocke.com.au/licensing-essentials-navigating-the-payments-licensing-maze/
- LegalVision, non-cash payment facilities: https://legalvision.com.au/non-cash-payment-facilities-franchises/
- Allens, payments licensing reform tranche one: https://www.allens.com.au/insights-news/insights/2025/10/first-tranche-of-payments-licensing-reforms-what-you-need-to-know/
- Gadens, payment functions reform: https://www.gadens.com/legal-insights/australian-payments-systems-reform-seven-proposed-payment-functions-to-replace-non-cash-licensing-regime/
- Stripe Payments Australia AFSL 500105: https://search-afsl.com/Stripe%20Payments%20Australia%20Pty%20ltd/afs-licensee/500105/ and https://stripe.com/en-au/legal/ssa
- ACCC, rental industry ACL guide: https://www.accc.gov.au/system/files/Rental%20cars%20-%20an%20industry%20guide%20to%20the%20Australian%20Consumer%20Law.pdf
- ACCC, repair replace refund: https://www.accc.gov.au/consumers/problem-with-a-product-or-service-you-bought/repair-replace-refund-cancel
- Sprintlaw, security deposits: https://sprintlaw.com.au/articles/security-deposits-explained-essential-australian-business-guide/
