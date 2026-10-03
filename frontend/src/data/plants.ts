import type { Plant } from "@/types/plant";

export const PLANTS: Plant[] = [
  { id: 'acacia', common: 'Mimosa', latin: 'Acacia dealbata', pt: 'Mimosa', family: 'Fabaceae', native: 'South-east Australia', flowering: 'January – March', habitat: 'Banks, slopes and burnt ground',
    status: 'Listed invasive in Portugal (Decreto-Lei 92/2019)',
    chars: [['Form', 'Evergreen tree, usually 5–15 m, forming dense stands.'], ['Leaves', 'Feathery, twice-divided, silvery blue-green; very small leaflets.'], ['Flowers', 'Bright yellow, fluffy round heads in large clusters; strong scent.'], ['Fruit', 'Flat brown pods with hard seeds that stay viable in the soil for decades.'], ['Spread', 'Seeds and vigorous suckers from the roots, especially after fire or cutting.']],
    look: [
      { common: 'Gorse', latin: 'Ulex europaeus', shared: ['Yellow flowers', 'Winter flowering', 'Dense growth'], diffs: ['Spiny shrub, rarely over 2 m', 'Pea-shaped flowers, not fluffy balls', 'No feathery leaves, only spines'] },
      { common: 'Portuguese broom', latin: 'Cytisus striatus', shared: ['Yellow flowers', 'Pods', 'Grows on slopes'], diffs: ['Shrub with green, nearly leafless stems', 'Pea-shaped flowers in spring', 'Hairy pods'] }],
    caution: 'Cutting alone makes it resprout from the stump and roots.',
    steps: [['Pull seedlings', 'Hand-pull young plants when soil is moist, removing the whole root.'], ['Ring-bark adults', 'Remove a 20–30 cm band of bark to below the cambium around the trunk, down to the roots.'], ['Leave to die standing', 'Let the tree dry out for 1–2 years before felling.'], ['Monitor', 'Return every year to pull new seedlings from the seed bank.']] },
  { id: 'arundo', common: 'Giant reed', latin: 'Arundo donax', pt: 'Cana', family: 'Poaceae', native: 'Asia', flowering: 'August – November', habitat: 'Riverbanks and wet ditches',
    status: 'Listed invasive in Portugal (Decreto-Lei 92/2019)',
    chars: [['Form', 'Giant perennial grass, 2–6 m, in thick clumps.'], ['Stems', 'Hollow, cane-like, 2–4 cm thick, like bamboo.'], ['Leaves', 'Broad (up to 7 cm), grey-green, clasping the stem with a heart-shaped base.'], ['Flowers', 'Large, dense, feathery plume, pale cream.'], ['Spread', 'Thick rhizomes; stem and root fragments carried by floods.']],
    look: [
      { common: 'Common reed', latin: 'Phragmites australis', shared: ['Tall reed', 'Feathery plume', 'Wet ground'], diffs: ['Thinner stems, under 1.5 cm', 'Narrower leaves, up to 3 cm', 'Plume purplish-brown', 'Usually 1–4 m tall'] }],
    caution: 'Never leave cut stems or roots near the water; fragments root downstream.',
    steps: [['Cut repeatedly', 'Cut stems at ground level several times a year to exhaust the rhizomes.'], ['Dig out rhizomes', 'For small stands, dig out the entire rhizome mass.'], ['Cover', 'Cover cut stands with thick dark sheeting for at least one year.'], ['Dispose safely', 'Dry and remove all material well away from the river.']] },
  { id: 'tradescantia', common: 'Small-leaf spiderwort', latin: 'Tradescantia fluminensis', pt: 'Erva-da-fortuna', family: 'Commelinaceae', native: 'South America', flowering: 'Spring – autumn', habitat: 'Shaded, damp riverside woodland',
    status: 'Listed invasive in Portugal (Decreto-Lei 92/2019)',
    chars: [['Form', 'Low creeping herb forming dense carpets up to 60 cm deep.'], ['Stems', 'Succulent, jointed, rooting at every node.'], ['Leaves', 'Glossy, oval, pointed, with a sheath around the stem.'], ['Flowers', 'Small, white, with three petals.'], ['Spread', 'Stem fragments; any piece with a node can regrow.']],
    look: [
      { common: 'Greater stitchwort', latin: 'Stellaria holostea', shared: ['White flowers', 'Shaded banks', 'Low growth'], diffs: ['Five deeply notched petals', 'Narrow, grass-like opposite leaves', 'Thin, square, non-succulent stems'] }],
    caution: 'Every leftover fragment can regrow into a new plant.',
    steps: [['Hand-pull', 'Roll up the mat, working inwards from the edges.'], ['Collect fragments', 'Rake the area and pick up every piece of stem.'], ['Bag it', 'Seal in bags and let it rot or dispose of it as green waste away from the river.'], ['Repeat', 'Check every 2–3 months for regrowth.']] },
  { id: 'pontederia', common: 'Water hyacinth', latin: 'Pontederia crassipes', pt: 'Jacinto-de-água', family: 'Pontederiaceae', native: 'Amazon basin', flowering: 'Summer – autumn', habitat: 'Slow water and still pools',
    status: 'Listed invasive in Portugal; EU list of concern',
    chars: [['Form', 'Free-floating aquatic plant forming thick mats on the water.'], ['Leaves', 'Glossy, rounded, in rosettes; leaf stalks swollen and spongy.'], ['Flowers', 'Spikes of lilac flowers, the top petal with a yellow spot.'], ['Roots', 'Dark, feathery, hanging in the water.'], ['Spread', 'Daughter plants on runners; can double in two weeks.']],
    look: [
      { common: 'White water lily', latin: 'Nymphaea alba', shared: ['Floating leaves', 'Showy flowers', 'Still water'], diffs: ['Rooted in the riverbed', 'Flat leaves with a deep slit', 'Large white flowers', 'No swollen leaf stalks'] },
      { common: 'Frogbit', latin: 'Hydrocharis morsus-ranae', shared: ['Floating rosettes', 'Rounded leaves'], diffs: ['Much smaller leaves, 2–5 cm', 'Three white petals', 'Thin, not spongy, stalks'] }],
    caution: 'Selling, transporting or releasing it is illegal in the EU.',
    steps: [['Contain', 'Place floating booms to stop the mat moving downstream.'], ['Remove whole plants', 'Lift with nets or rakes, including all roots.'], ['Dry away from water', 'Pile well above flood level to dry out.'], ['Report', 'Record every sighting so new outbreaks are caught early.']] },
  { id: 'carpobrotus', common: 'Hottentot fig', latin: 'Carpobrotus edulis', pt: 'Chorão', family: 'Aizoaceae', native: 'South Africa', flowering: 'March – July', habitat: 'Sandy ground near the river mouth',
    status: 'Listed invasive in Portugal (Decreto-Lei 92/2019)',
    chars: [['Form', 'Mat-forming succulent, spreading several metres.'], ['Leaves', 'Fleshy, three-angled in section, curved, green to red.'], ['Flowers', 'Large, yellow fading to pink, many narrow petals.'], ['Fruit', 'Fleshy, fig-like, eaten and spread by animals.'], ['Spread', 'Rooting stems and seeds.']],
    look: [
      { common: 'White stonecrop', latin: 'Sedum album', shared: ['Succulent leaves', 'Mat-forming', 'Dry, sunny ground'], diffs: ['Tiny cylindrical leaves, under 1 cm', 'Clusters of small white star-shaped flowers', 'Low mats, a few cm high'] }],
    caution: 'Remove the whole mat; buried stems re-root.',
    steps: [['Pull by hand', 'Lift the edge of the mat and roll it up.'], ['Remove all fragments', 'Sieve or rake the surface for leftover pieces.'], ['Take it away', 'Bag and remove; it survives for months on the ground.'], ['Replant natives', 'Stabilise the bare ground with native species.']] },
  { id: 'cortaderia', common: 'Pampas grass', latin: 'Cortaderia selloana', pt: 'Erva-das-pampas', family: 'Poaceae', native: 'South America', flowering: 'August – October', habitat: 'Disturbed ground and road verges',
    status: 'Listed invasive in Portugal (Decreto-Lei 92/2019)',
    chars: [['Form', 'Large tussock grass, 2–4 m with plumes.'], ['Leaves', 'Long, narrow, arching, with razor-sharp edges.'], ['Flowers', 'Silvery-white to pinkish plumes on tall stalks.'], ['Seeds', 'Up to a million per plant, carried by wind.'], ['Roots', 'Dense crown with deep fibrous roots.']],
    look: [
      { common: 'Common reed', latin: 'Phragmites australis', shared: ['Tall plumes', 'Grass', 'Late-summer flowering'], diffs: ['Grows in water, not tussocks', 'Leaves spread along the stem', 'Leaves not sharp-edged', 'Brownish-purple plumes'] }],
    caution: 'Wear thick gloves and eye protection; the leaves cut.',
    steps: [['Cut the plumes', 'Before they open, cut and bag all plumes.'], ['Cut the foliage', 'Cut the tussock back close to the crown.'], ['Dig out the crown', 'Dig out the whole root crown with a mattock.'], ['Watch for seedlings', 'Check the area the following year.']] },
  { id: 'ipomoea', common: 'Blue morning glory', latin: 'Ipomoea indica', pt: 'Bons-dias', family: 'Convolvulaceae', native: 'Tropical America', flowering: 'Spring – autumn', habitat: 'Hedges and riverside trees',
    status: 'Listed invasive in Portugal (Decreto-Lei 92/2019)',
    chars: [['Form', 'Vigorous twining climber, smothering trees and shrubs.'], ['Leaves', 'Heart-shaped or three-lobed, soft, hairy.'], ['Flowers', 'Trumpet-shaped, blue-violet fading to pink in the afternoon.'], ['Spread', 'Runners that root where they touch the ground.']],
    look: [
      { common: 'Hedge bindweed', latin: 'Calystegia sepium', shared: ['Twining climber', 'Trumpet flowers', 'Hedges'], diffs: ['White flowers', 'Arrow-shaped leaves', 'Less dense growth'] },
      { common: 'Field bindweed', latin: 'Convolvulus arvensis', shared: ['Trumpet flowers', 'Twining stems'], diffs: ['Small flowers, 1–2 cm', 'White or pale pink', 'Low, creeping growth'] }],
    caution: 'Cut stems left in trees stay alive for weeks and can re-root.',
    steps: [['Cut at the base', 'Cut all stems near the ground.'], ['Pull runners', 'Pull runners from the ground and dig out the root.'], ['Remove from canopy', 'Pull down dead stems once dry.'], ['Repeat', 'Check for regrowth every season.']] },
  { id: 'ailanthus', common: 'Tree of heaven', latin: 'Ailanthus altissima', pt: 'Espanta-lobos', family: 'Simaroubaceae', native: 'China', flowering: 'June – July', habitat: 'Banks, walls and wasteland',
    status: 'Listed invasive in Portugal; EU list of concern',
    chars: [['Form', 'Fast-growing deciduous tree, up to 20 m.'], ['Leaves', 'Very large (30–90 cm), with 11–25 leaflets, each with a gland-tipped tooth near the base.'], ['Smell', 'Crushed leaves and stems smell unpleasant.'], ['Fruit', 'Winged seeds in reddish-brown clusters.'], ['Spread', 'Abundant seeds and root suckers.']],
    look: [
      { common: 'Narrow-leaved ash', latin: 'Fraxinus angustifolia', shared: ['Pinnate leaves', 'Winged seeds', 'Riverbanks'], diffs: ['Leaves opposite on the twig', 'Leaflets toothed all along the edge', 'Dark buds', 'No bad smell'] }],
    caution: 'Cutting or felling triggers masses of root suckers.',
    steps: [['Pull seedlings', 'Pull young plants with the full root.'], ['Treat adults in place', 'Professionals use stem injection or partial ring-barking in summer.'], ['Fell when dead', 'Remove the tree only once it and its roots are dead.'], ['Monitor suckers', 'Pull any suckers for several years.']] },
  { id: 'oxalis', common: 'Bermuda buttercup', latin: 'Oxalis pes-caprae', pt: 'Azedas', family: 'Oxalidaceae', native: 'South Africa', flowering: 'November – April', habitat: 'Fields, verges and banks',
    status: 'Listed invasive in Portugal (Decreto-Lei 92/2019)',
    chars: [['Form', 'Low herb, up to 30 cm, dying back in summer.'], ['Leaves', 'Clover-like, with three heart-shaped leaflets, often purple-spotted.'], ['Flowers', 'Bright yellow, funnel-shaped, five petals.'], ['Spread', 'Small underground bulbils; seeds are not produced in Portugal.']],
    look: [
      { common: 'Lesser celandine', latin: 'Ficaria verna', shared: ['Yellow flowers', 'Winter-spring', 'Low growth'], diffs: ['8–12 glossy petals', 'Single, glossy, heart-shaped leaves', 'No three-part leaves'] }],
    caution: 'Digging or tilling without care spreads the bulbils.',
    steps: [['Dig carefully', 'Lift the whole plant with the soil around the bulb.'], ['Sieve the soil', 'Remove every small bulbil.'], ['Act before summer', 'Remove before the plant dies back and the bulbils are hidden.'], ['Mulch', 'Cover the area to shade out regrowth.']] },
];

export const plantById = (id: string): Pick<Plant, "common" | "latin"> =>
  PLANTS.find((p) => p.id === id) ?? { common: id, latin: "" };
