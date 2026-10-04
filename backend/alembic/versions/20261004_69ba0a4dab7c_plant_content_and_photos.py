"""plant content and photos

Moves the field-guide content (until now hard-coded in the frontend) into the database:
species details, characteristics, removal steps, native look-alikes and public photo URLs.

Revision ID: 69ba0a4dab7c
Revises: b07c5235eab6
Create Date: 2026-10-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "69ba0a4dab7c"
down_revision: Union[str, Sequence[str], None] = "b07c5235eab6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

NEW_TABLES = ["species_photos", "species_characteristics", "removal_steps", "native_plants", "native_plant_photos", "look_alikes"]
SPECIES_COLUMNS = ["local_name", "family", "native_range", "flowering", "habitat", "legal_status", "caution"]

# Photo URLs are public Wikimedia Commons images; position 0 is the main photo.
NATIVE_PLANTS = [{'id': 'ulex-europaeus',
  'latin_name': 'Ulex europaeus',
  'common_name': 'Gorse',
  'photos': ['https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/Ulex_europaeus_Mynydd_Carningli_flowers.jpg/1920px-Ulex_europaeus_Mynydd_Carningli_flowers.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/20220620_132753_gorse.jpg/1920px-20220620_132753_gorse.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/2025_Vexetaci%C3%B3n_nas_Ru%C3%ADnas_de_San_Tirso._Xove._Galiza.jpg/1920px-2025_Vexetaci%C3%B3n_nas_Ru%C3%ADnas_de_San_Tirso._Xove._Galiza.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/274213284_463378219675_Rossena.jpg/1920px-274213284_463378219675_Rossena.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/Ajonc_%282%29.jpg/1920px-Ajonc_%282%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/Ajoncs_sur_un_muret_-_A41060.jpg/1920px-Ajoncs_sur_un_muret_-_A41060.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail']},
 {'id': 'cytisus-striatus',
  'latin_name': 'Cytisus striatus',
  'common_name': 'Portuguese broom',
  'photos': ['https://upload.wikimedia.org/wikipedia/commons/c/c9/Cytisus_striatus_2.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/2026-06-27_Portuguese_Broom_in_Parque_Natural_das_Serras_de_Aire_e_Candeeiros.jpg/1920px-2026-06-27_Portuguese_Broom_in_Parque_Natural_das_Serras_de_Aire_e_Candeeiros.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c6/Beleza_da_flora_perto_do_rio_de_Currelos.2.jpg/1920px-Beleza_da_flora_perto_do_rio_de_Currelos.2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/Camptopus_lateralis_-_Cytisus_striatus_20190619a.jpg/1920px-Camptopus_lateralis_-_Cytisus_striatus_20190619a.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://upload.wikimedia.org/wikipedia/commons/4/4d/Camptopus_lateralis_20190621a.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/Camptopus_lateralis_20190621b.jpg/1920px-Camptopus_lateralis_20190621b.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail']},
 {'id': 'phragmites-australis',
  'latin_name': 'Phragmites australis',
  'common_name': 'Common reed',
  'photos': ['https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/Reed_panicle_at_Brodalen_1.jpg/1920px-Reed_panicle_at_Brodalen_1.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/%2A_%EA%B0%88%EB%8C%80_%2A.jpg/1920px-%2A_%EA%B0%88%EB%8C%80_%2A.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/20111101Phragmites_australis08.jpg/1920px-20111101Phragmites_australis08.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/20111101Phragmites_australis13.jpg/1920px-20111101Phragmites_australis13.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/72/20141228Phragmites_australis1.jpg/1920px-20141228Phragmites_australis1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/20141228Phragmites_australis2.jpg/1920px-20141228Phragmites_australis2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail']},
 {'id': 'stellaria-holostea',
  'latin_name': 'Stellaria holostea',
  'common_name': 'Greater stitchwort',
  'photos': ['https://upload.wikimedia.org/wikipedia/commons/b/b2/Stellaria_holostea_Grote_muur.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/86/20150413Stellaria_holostea2.jpg/1920px-20150413Stellaria_holostea2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/86/20150413Stellaria_holostea3.jpg/1920px-20150413Stellaria_holostea3.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://upload.wikimedia.org/wikipedia/commons/7/7e/20170414Stellaria_holostea1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/20170414Stellaria_holostea2.jpg/1920px-20170414Stellaria_holostea2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/20210417_Rabelera_holostea_02.jpg/1920px-20210417_Rabelera_holostea_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail']},
 {'id': 'nymphaea-alba',
  'latin_name': 'Nymphaea alba',
  'common_name': 'White water lily',
  'photos': ['https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/2016_Kwiat_grzybieni_bia%C5%82ych_2.jpg/1920px-2016_Kwiat_grzybieni_bia%C5%82ych_2.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/20130714Nymphaea_alba1.jpg/1920px-20130714Nymphaea_alba1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/20130714Nymphaea_alba2.jpg/1920px-20130714Nymphaea_alba2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/20150613Nymphaea_alba2.jpg/1920px-20150613Nymphaea_alba2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/41/20160506Nymphaea_alba1.jpg/1920px-20160506Nymphaea_alba1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/20160516Nymphaea_alba1.jpg/1920px-20160516Nymphaea_alba1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail']},
 {'id': 'hydrocharis-morsus-ranae',
  'latin_name': 'Hydrocharis morsus-ranae',
  'common_name': 'Frogbit',
  'photos': ['https://upload.wikimedia.org/wikipedia/commons/a/ad/HydrocharisMorsus-ranae2.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/20200906Hydrocharis_morsus-ranae2.jpg/1920px-20200906Hydrocharis_morsus-ranae2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/European_Frog-Bit_%28Hydrocharis_morsus-ranae%29_-_Norfolk_County%2C_Ontario_2019-06-09.jpg/1920px-European_Frog-Bit_%28Hydrocharis_morsus-ranae%29_-_Norfolk_County%2C_Ontario_2019-06-09.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://upload.wikimedia.org/wikipedia/commons/b/b4/Hydrocharis_morsus-ranae_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Hydrocharis_morsus-ranae_15-p.bot-hydro.morsu-01.jpg/1920px-Hydrocharis_morsus-ranae_15-p.bot-hydro.morsu-01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/Hydrocharis_morsus-ranae_15-p.bot-hydro.morsu-02.jpg/1920px-Hydrocharis_morsus-ranae_15-p.bot-hydro.morsu-02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail']},
 {'id': 'sedum-album',
  'latin_name': 'Sedum album',
  'common_name': 'White stonecrop',
  'photos': ['https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/White_stonecrop%2C_Autonomous_Province_of_Bolzano_%E2%80%93_South_Tyrol%2C_Italy_imported_from_iNaturalist_photo_382140510.jpg/1920px-White_stonecrop%2C_Autonomous_Province_of_Bolzano_%E2%80%93_South_Tyrol%2C_Italy_imported_from_iNaturalist_photo_382140510.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/85/.TS_20000101_010139.jpg/1920px-.TS_20000101_010139.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/20130421Sedum_album1.jpg/1920px-20130421Sedum_album1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/20170224Sedum_album1.jpg/1920px-20170224Sedum_album1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ea/20170224Sedum_album2.jpg/1920px-20170224Sedum_album2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/20170224Sedum_album3.jpg/1920px-20170224Sedum_album3.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail']},
 {'id': 'calystegia-sepium',
  'latin_name': 'Calystegia sepium',
  'common_name': 'Hedge bindweed',
  'photos': ['https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Calystegia_April_2008-1.jpg/1920px-Calystegia_April_2008-1.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
             'https://upload.wikimedia.org/wikipedia/commons/b/b1/2005-05-30_-_United_Kingdom_-_England_-_London_-_Regent%27s_Park_-_Miscellenaeous_4887245805.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/20120621Staden_Saarbruecken15.jpg/1920px-20120621Staden_Saarbruecken15.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/20120621Staden_Saarbruecken16.jpg/1920px-20120621Staden_Saarbruecken16.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/20120813Calystegia_sepium5.jpg/1920px-20120813Calystegia_sepium5.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/59/20120908Calystegia_sepium4.jpg/1920px-20120908Calystegia_sepium4.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail']},
 {'id': 'convolvulus-arvensis',
  'latin_name': 'Convolvulus arvensis',
  'common_name': 'Field bindweed',
  'photos': ['https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/Convolvulus_arvensis_in_Aveyron_%282%29.jpg/1920px-Convolvulus_arvensis_in_Aveyron_%282%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/00_2050_Ackerwinde_%28Convolvulus_arvensis%29.jpg/1920px-00_2050_Ackerwinde_%28Convolvulus_arvensis%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/20130604Ackerwinde.jpg/1920px-20130604Ackerwinde.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/20140526Convolvulus_arvensis3.jpg/1920px-20140526Convolvulus_arvensis3.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/2018-06-01_%28114%29_Convolvulus_arvensis_%28field_bindweed%29_at_Bichlh%C3%A4usl_in_Frankenfels%2C_Austria.jpg/1920px-2018-06-01_%28114%29_Convolvulus_arvensis_%28field_bindweed%29_at_Bichlh%C3%A4usl_in_Frankenfels%2C_Austria.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/2018-07-26_Bindweed%2C_%28Convolvulus_arvensis%29%2C_Trimingham.jpg/1920px-2018-07-26_Bindweed%2C_%28Convolvulus_arvensis%29%2C_Trimingham.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail']},
 {'id': 'fraxinus-angustifolia',
  'latin_name': 'Fraxinus angustifolia',
  'common_name': 'Narrow-leaved ash',
  'photos': ['https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b8/Fraxinus_angustifolia_foliage.jpg/1920px-Fraxinus_angustifolia_foliage.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/2008PenedaGeresPTCON0001_%2835%29.JPG/1920px-2008PenedaGeresPTCON0001_%2835%29.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/2017-03-21_A_view_down_to_the_Quarteira_River%2C_Boliqueime.JPG/1920px-2017-03-21_A_view_down_to_the_Quarteira_River%2C_Boliqueime.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Aravalle_07_by-dpc.jpg/1920px-Aravalle_07_by-dpc.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Autostazione_Empoli.jpg/1920px-Autostazione_Empoli.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Backlit_narrow-leaved_ash_leaves_%28Fraxinus_angustifolia%29_with_a_dog_walking_in_the_background%2C_Montes_Claros_%28Monsanto%29%2C_Lisbon%2C_Portugal_julesvernex2.jpg/1920px-Backlit_narrow-leaved_ash_leaves_%28Fraxinus_angustifolia%29_with_a_dog_walking_in_the_background%2C_Montes_Claros_%28Monsanto%29%2C_Lisbon%2C_Portugal_julesvernex2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail']},
 {'id': 'ficaria-verna',
  'latin_name': 'Ficaria verna',
  'common_name': 'Lesser celandine',
  'photos': ['https://upload.wikimedia.org/wikipedia/commons/0/0f/Flowers_%282425723494%29_cropped.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/012_Scharbockskraut_%28Ficaria_verna%29_in_Hann._M%C3%BCnden.jpg/1920px-012_Scharbockskraut_%28Ficaria_verna%29_in_Hann._M%C3%BCnden.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/28/20150324Ficaria_verna2.jpg/1920px-20150324Ficaria_verna2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/20150324Ficaria_verna3.jpg/1920px-20150324Ficaria_verna3.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/20150324Ficaria_verna4.jpg/1920px-20150324Ficaria_verna4.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/20150327Ficaria_verna3.jpg/1920px-20150327Ficaria_verna3.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail']}]

SPECIES = [{'id': 'acacia',
  'latin_name': 'Acacia dealbata',
  'common_name': 'Mimosa',
  'local_name': 'Mimosa',
  'family': 'Fabaceae',
  'native_range': 'South-east Australia',
  'flowering': 'January – March',
  'habitat': 'Banks, slopes and burnt ground',
  'legal_status': 'Listed invasive in Portugal (Decreto-Lei 92/2019)',
  'caution': 'Cutting alone makes it resprout from the stump and roots.',
  'display_order': 0,
  'photos': ['https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Acacia_dealbata-1.jpg/1920px-Acacia_dealbata-1.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/Acacia_dealbata_%2837128586083%29.jpg/1920px-Acacia_dealbata_%2837128586083%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Acacia_dealbata_%2837128635753%29.jpg/1920px-Acacia_dealbata_%2837128635753%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Acacia_dealbata_%2837540484220%29.jpg/1920px-Acacia_dealbata_%2837540484220%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Acacia_dealbata_%2837750303106%29.jpg/1920px-Acacia_dealbata_%2837750303106%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Acacia_dealbata_%285365020757%29.jpg/1920px-Acacia_dealbata_%285365020757%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail'],
  'characteristics': [['Form', 'Evergreen tree, usually 5–15 m, forming dense stands.'],
                      ['Leaves', 'Feathery, twice-divided, silvery blue-green; very small leaflets.'],
                      ['Flowers', 'Bright yellow, fluffy round heads in large clusters; strong scent.'],
                      ['Fruit', 'Flat brown pods with hard seeds that stay viable in the soil for decades.'],
                      ['Spread', 'Seeds and vigorous suckers from the roots, especially after fire or cutting.']],
  'removal_steps': [['Pull seedlings', 'Hand-pull young plants when soil is moist, removing the whole root.'],
                    ['Ring-bark adults',
                     'Remove a 20–30 cm band of bark to below the cambium around the trunk, down to the roots.'],
                    ['Leave to die standing', 'Let the tree dry out for 1–2 years before felling.'],
                    ['Monitor', 'Return every year to pull new seedlings from the seed bank.']],
  'look_alikes': [{'native_plant_id': 'ulex-europaeus',
                   'shared_traits': ['Yellow flowers', 'Winter flowering', 'Dense growth'],
                   'differences': ['Spiny shrub, rarely over 2 m',
                                   'Pea-shaped flowers, not fluffy balls',
                                   'No feathery leaves, only spines']},
                  {'native_plant_id': 'cytisus-striatus',
                   'shared_traits': ['Yellow flowers', 'Pods', 'Grows on slopes'],
                   'differences': ['Shrub with green, nearly leafless stems',
                                   'Pea-shaped flowers in spring',
                                   'Hairy pods']}]},
 {'id': 'arundo',
  'latin_name': 'Arundo donax',
  'common_name': 'Giant reed',
  'local_name': 'Cana',
  'family': 'Poaceae',
  'native_range': 'Asia',
  'flowering': 'August – November',
  'habitat': 'Riverbanks and wet ditches',
  'legal_status': 'Listed invasive in Portugal (Decreto-Lei 92/2019)',
  'caution': 'Never leave cut stems or roots near the water; fragments root downstream.',
  'display_order': 1,
  'photos': ['https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/Giant_Reed_%28Canna_Comune%29_%28Arundo_donax%29_-_Rome%2C_Italy_2024-03-02.jpg/1920px-Giant_Reed_%28Canna_Comune%29_%28Arundo_donax%29_-_Rome%2C_Italy_2024-03-02.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
             'https://upload.wikimedia.org/wikipedia/commons/a/ab/2021_Exposici%C3%B3n_Arquitectura_Atemporal_CentroCentro_-_Ca%C3%B1a_%28Arundo_donax%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Arundo_Donax_dopo_4_settimane_dal_trapianto_in_vaso.jpg/1920px-Arundo_Donax_dopo_4_settimane_dal_trapianto_in_vaso.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/Arundo_Donax_dopo_circa_4_settimane.jpg/1920px-Arundo_Donax_dopo_circa_4_settimane.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Arundo_donax_%28%CE%A0%CE%B5%CE%BB%CE%BF%CF%80%CF%8C%CE%BD%CE%BD%CE%B7%CF%83%CE%BF%CF%82%29.jpg/1920px-Arundo_donax_%28%CE%A0%CE%B5%CE%BB%CE%BF%CF%80%CF%8C%CE%BD%CE%BD%CE%B7%CF%83%CE%BF%CF%82%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/Arundo_donax_-_Chelsea_Physic_Garden_-_DSC02804.jpg/1920px-Arundo_donax_-_Chelsea_Physic_Garden_-_DSC02804.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail'],
  'characteristics': [['Form', 'Giant perennial grass, 2–6 m, in thick clumps.'],
                      ['Stems', 'Hollow, cane-like, 2–4 cm thick, like bamboo.'],
                      ['Leaves', 'Broad (up to 7 cm), grey-green, clasping the stem with a heart-shaped base.'],
                      ['Flowers', 'Large, dense, feathery plume, pale cream.'],
                      ['Spread', 'Thick rhizomes; stem and root fragments carried by floods.']],
  'removal_steps': [['Cut repeatedly', 'Cut stems at ground level several times a year to exhaust the rhizomes.'],
                    ['Dig out rhizomes', 'For small stands, dig out the entire rhizome mass.'],
                    ['Cover', 'Cover cut stands with thick dark sheeting for at least one year.'],
                    ['Dispose safely', 'Dry and remove all material well away from the river.']],
  'look_alikes': [{'native_plant_id': 'phragmites-australis',
                   'shared_traits': ['Tall reed', 'Feathery plume', 'Wet ground'],
                   'differences': ['Thinner stems, under 1.5 cm',
                                   'Narrower leaves, up to 3 cm',
                                   'Plume purplish-brown',
                                   'Usually 1–4 m tall']}]},
 {'id': 'tradescantia',
  'latin_name': 'Tradescantia fluminensis',
  'common_name': 'Small-leaf spiderwort',
  'local_name': 'Erva-da-fortuna',
  'family': 'Commelinaceae',
  'native_range': 'South America',
  'flowering': 'Spring – autumn',
  'habitat': 'Shaded, damp riverside woodland',
  'legal_status': 'Listed invasive in Portugal (Decreto-Lei 92/2019)',
  'caution': 'Every leftover fragment can regrow into a new plant.',
  'display_order': 2,
  'photos': ['https://upload.wikimedia.org/wikipedia/commons/e/ef/Tradescantia_fluminensis_%28Flowers%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled',
             'https://upload.wikimedia.org/wikipedia/commons/8/8d/20040413_Tradescantia_Tricolor.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
             'https://upload.wikimedia.org/wikipedia/commons/1/12/EB1911_Plants_%28Cytology%29_-_epidermal_cells_of_Tradescantia_fluminensis.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/Flowers_of_Tradescantia_fluminensis_20170526.jpg/1920px-Flowers_of_Tradescantia_fluminensis_20170526.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/Starr_070621-7415_Tradescantia_fluminensis.jpg/1920px-Starr_070621-7415_Tradescantia_fluminensis.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/Starr_070621-7416_Tradescantia_fluminensis.jpg/1920px-Starr_070621-7416_Tradescantia_fluminensis.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail'],
  'characteristics': [['Form', 'Low creeping herb forming dense carpets up to 60 cm deep.'],
                      ['Stems', 'Succulent, jointed, rooting at every node.'],
                      ['Leaves', 'Glossy, oval, pointed, with a sheath around the stem.'],
                      ['Flowers', 'Small, white, with three petals.'],
                      ['Spread', 'Stem fragments; any piece with a node can regrow.']],
  'removal_steps': [['Hand-pull', 'Roll up the mat, working inwards from the edges.'],
                    ['Collect fragments', 'Rake the area and pick up every piece of stem.'],
                    ['Bag it', 'Seal in bags and let it rot or dispose of it as green waste away from the river.'],
                    ['Repeat', 'Check every 2–3 months for regrowth.']],
  'look_alikes': [{'native_plant_id': 'stellaria-holostea',
                   'shared_traits': ['White flowers', 'Shaded banks', 'Low growth'],
                   'differences': ['Five deeply notched petals',
                                   'Narrow, grass-like opposite leaves',
                                   'Thin, square, non-succulent stems']}]},
 {'id': 'pontederia',
  'latin_name': 'Pontederia crassipes',
  'common_name': 'Water hyacinth',
  'local_name': 'Jacinto-de-água',
  'family': 'Pontederiaceae',
  'native_range': 'Amazon basin',
  'flowering': 'Summer – autumn',
  'habitat': 'Slow water and still pools',
  'legal_status': 'Listed invasive in Portugal; EU list of concern',
  'caution': 'Selling, transporting or releasing it is illegal in the EU.',
  'display_order': 3,
  'photos': ['https://upload.wikimedia.org/wikipedia/commons/c/c3/Eichhornia_crassipes_C.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/A_Eichhornia_crassipes_plant.jpg/1920px-A_Eichhornia_crassipes_plant.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/Aguap%C3%A9_-_G%C3%A1lia-SP.jpg/1920px-Aguap%C3%A9_-_G%C3%A1lia-SP.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/Baillon%27s_Crake_in_Baruipur_February_2024_by_Tisha_Mukherjee_03.jpg/1920px-Baillon%27s_Crake_in_Baruipur_February_2024_by_Tisha_Mukherjee_03.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Bloomed_Water_Hyacinth_%28Eichhornia_crassipes%29_carpet_in_a_wetland%2C_Bangladesh_2026.jpg/1920px-Bloomed_Water_Hyacinth_%28Eichhornia_crassipes%29_carpet_in_a_wetland%2C_Bangladesh_2026.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/Camalote_-_jacinto_de_agua_-Eichhornia_crassipes-_lirio_acu%C3%A1tico_01.jpg/1920px-Camalote_-_jacinto_de_agua_-Eichhornia_crassipes-_lirio_acu%C3%A1tico_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail'],
  'characteristics': [['Form', 'Free-floating aquatic plant forming thick mats on the water.'],
                      ['Leaves', 'Glossy, rounded, in rosettes; leaf stalks swollen and spongy.'],
                      ['Flowers', 'Spikes of lilac flowers, the top petal with a yellow spot.'],
                      ['Roots', 'Dark, feathery, hanging in the water.'],
                      ['Spread', 'Daughter plants on runners; can double in two weeks.']],
  'removal_steps': [['Contain', 'Place floating booms to stop the mat moving downstream.'],
                    ['Remove whole plants', 'Lift with nets or rakes, including all roots.'],
                    ['Dry away from water', 'Pile well above flood level to dry out.'],
                    ['Report', 'Record every sighting so new outbreaks are caught early.']],
  'look_alikes': [{'native_plant_id': 'nymphaea-alba',
                   'shared_traits': ['Floating leaves', 'Showy flowers', 'Still water'],
                   'differences': ['Rooted in the riverbed',
                                   'Flat leaves with a deep slit',
                                   'Large white flowers',
                                   'No swollen leaf stalks']},
                  {'native_plant_id': 'hydrocharis-morsus-ranae',
                   'shared_traits': ['Floating rosettes', 'Rounded leaves'],
                   'differences': ['Much smaller leaves, 2–5 cm', 'Three white petals', 'Thin, not spongy, stalks']}]},
 {'id': 'carpobrotus',
  'latin_name': 'Carpobrotus edulis',
  'common_name': 'Hottentot fig',
  'local_name': 'Chorão',
  'family': 'Aizoaceae',
  'native_range': 'South Africa',
  'flowering': 'March – July',
  'habitat': 'Sandy ground near the river mouth',
  'legal_status': 'Listed invasive in Portugal (Decreto-Lei 92/2019)',
  'caution': 'Remove the whole mat; buried stems re-root.',
  'display_order': 4,
  'photos': ['https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Hottentot_Fig_-_Flowering.jpg/1920px-Hottentot_Fig_-_Flowering.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/0154_SMED_Photography_-_Carpobrotus_edulis.jpg/1920px-0154_SMED_Photography_-_Carpobrotus_edulis.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://upload.wikimedia.org/wikipedia/commons/3/32/2_Carpobrotus_edulis_Cape_Town.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
             'https://upload.wikimedia.org/wikipedia/commons/6/60/2_Carpobrotus_edulis_Karoo.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
             'https://upload.wikimedia.org/wikipedia/commons/2/21/200707_x_Griffe_de_sorci%C3%A8re.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
             'https://upload.wikimedia.org/wikipedia/commons/8/8d/Caprobrotus_edulis_%28Aizoaceae%29_%284582072366%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled'],
  'characteristics': [['Form', 'Mat-forming succulent, spreading several metres.'],
                      ['Leaves', 'Fleshy, three-angled in section, curved, green to red.'],
                      ['Flowers', 'Large, yellow fading to pink, many narrow petals.'],
                      ['Fruit', 'Fleshy, fig-like, eaten and spread by animals.'],
                      ['Spread', 'Rooting stems and seeds.']],
  'removal_steps': [['Pull by hand', 'Lift the edge of the mat and roll it up.'],
                    ['Remove all fragments', 'Sieve or rake the surface for leftover pieces.'],
                    ['Take it away', 'Bag and remove; it survives for months on the ground.'],
                    ['Replant natives', 'Stabilise the bare ground with native species.']],
  'look_alikes': [{'native_plant_id': 'sedum-album',
                   'shared_traits': ['Succulent leaves', 'Mat-forming', 'Dry, sunny ground'],
                   'differences': ['Tiny cylindrical leaves, under 1 cm',
                                   'Clusters of small white star-shaped flowers',
                                   'Low mats, a few cm high']}]},
 {'id': 'cortaderia',
  'latin_name': 'Cortaderia selloana',
  'common_name': 'Pampas grass',
  'local_name': 'Erva-das-pampas',
  'family': 'Poaceae',
  'native_range': 'South America',
  'flowering': 'August – October',
  'habitat': 'Disturbed ground and road verges',
  'legal_status': 'Listed invasive in Portugal (Decreto-Lei 92/2019)',
  'caution': 'Wear thick gloves and eye protection; the leaves cut.',
  'display_order': 5,
  'photos': ['https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Herbe_Pampa_FR_2008.jpg/1920px-Herbe_Pampa_FR_2008.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/2025-11-02_Caldas_da_Rainha_9.jpg/1920px-2025-11-02_Caldas_da_Rainha_9.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/2025-11-02_Forest_near_Nadadouro_1.jpg/1920px-2025-11-02_Forest_near_Nadadouro_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/2025-11-02_Forest_near_Nadadouro_2.jpg/1920px-2025-11-02_Forest_near_Nadadouro_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cd/2025-11-02_Forest_near_Nadadouro_3.jpg/1920px-2025-11-02_Forest_near_Nadadouro_3.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/2025-11-02_Landscape_near_Nadadouro_1.jpg/1920px-2025-11-02_Landscape_near_Nadadouro_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail'],
  'characteristics': [['Form', 'Large tussock grass, 2–4 m with plumes.'],
                      ['Leaves', 'Long, narrow, arching, with razor-sharp edges.'],
                      ['Flowers', 'Silvery-white to pinkish plumes on tall stalks.'],
                      ['Seeds', 'Up to a million per plant, carried by wind.'],
                      ['Roots', 'Dense crown with deep fibrous roots.']],
  'removal_steps': [['Cut the plumes', 'Before they open, cut and bag all plumes.'],
                    ['Cut the foliage', 'Cut the tussock back close to the crown.'],
                    ['Dig out the crown', 'Dig out the whole root crown with a mattock.'],
                    ['Watch for seedlings', 'Check the area the following year.']],
  'look_alikes': [{'native_plant_id': 'phragmites-australis',
                   'shared_traits': ['Tall plumes', 'Grass', 'Late-summer flowering'],
                   'differences': ['Grows in water, not tussocks',
                                   'Leaves spread along the stem',
                                   'Leaves not sharp-edged',
                                   'Brownish-purple plumes']}]},
 {'id': 'ipomoea',
  'latin_name': 'Ipomoea indica',
  'common_name': 'Blue morning glory',
  'local_name': 'Bons-dias',
  'family': 'Convolvulaceae',
  'native_range': 'Tropical America',
  'flowering': 'Spring – autumn',
  'habitat': 'Hedges and riverside trees',
  'legal_status': 'Listed invasive in Portugal (Decreto-Lei 92/2019)',
  'caution': 'Cut stems left in trees stay alive for weeks and can re-root.',
  'display_order': 6,
  'photos': ['https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Bons-dias_%28Ipomoea_indica%29_em_terreno_baldio_em_Bag%C3%A9.jpg/1920px-Bons-dias_%28Ipomoea_indica%29_em_terreno_baldio_em_Bag%C3%A9.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/A_Japanese_morning_glory.jpg/1920px-A_Japanese_morning_glory.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bf/Batatilla_-_Campanita_%28Ipomoea_indica%29_%2814673960710%29.jpg/1920px-Batatilla_-_Campanita_%28Ipomoea_indica%29_%2814673960710%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ea/Batatilla_-_Campanita_%28Ipomoea_indica%29_%2814674074828%29.jpg/1920px-Batatilla_-_Campanita_%28Ipomoea_indica%29_%2814674074828%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Bons-dias_%28Ipomoea_indica%29_em_terreno_baldio_em_Bag%C3%A9_-_54957455117.jpg/1920px-Bons-dias_%28Ipomoea_indica%29_em_terreno_baldio_em_Bag%C3%A9_-_54957455117.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/Bons-dias_%28Ipomoea_indica%29_em_terreno_baldio_em_Bag%C3%A9_-_54958525348.jpg/1920px-Bons-dias_%28Ipomoea_indica%29_em_terreno_baldio_em_Bag%C3%A9_-_54958525348.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail'],
  'characteristics': [['Form', 'Vigorous twining climber, smothering trees and shrubs.'],
                      ['Leaves', 'Heart-shaped or three-lobed, soft, hairy.'],
                      ['Flowers', 'Trumpet-shaped, blue-violet fading to pink in the afternoon.'],
                      ['Spread', 'Runners that root where they touch the ground.']],
  'removal_steps': [['Cut at the base', 'Cut all stems near the ground.'],
                    ['Pull runners', 'Pull runners from the ground and dig out the root.'],
                    ['Remove from canopy', 'Pull down dead stems once dry.'],
                    ['Repeat', 'Check for regrowth every season.']],
  'look_alikes': [{'native_plant_id': 'calystegia-sepium',
                   'shared_traits': ['Twining climber', 'Trumpet flowers', 'Hedges'],
                   'differences': ['White flowers', 'Arrow-shaped leaves', 'Less dense growth']},
                  {'native_plant_id': 'convolvulus-arvensis',
                   'shared_traits': ['Trumpet flowers', 'Twining stems'],
                   'differences': ['Small flowers, 1–2 cm', 'White or pale pink', 'Low, creeping growth']}]},
 {'id': 'ailanthus',
  'latin_name': 'Ailanthus altissima',
  'common_name': 'Tree of heaven',
  'local_name': 'Espanta-lobos',
  'family': 'Simaroubaceae',
  'native_range': 'China',
  'flowering': 'June – July',
  'habitat': 'Banks, walls and wasteland',
  'legal_status': 'Listed invasive in Portugal; EU list of concern',
  'caution': 'Cutting or felling triggers masses of root suckers.',
  'display_order': 7,
  'photos': ['https://upload.wikimedia.org/wikipedia/commons/e/eb/G%C3%B6tterbaum_%28Ailanthus_altissima%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/20180921Ailanthus_altissima.jpg/1920px-20180921Ailanthus_altissima.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://upload.wikimedia.org/wikipedia/commons/f/f3/A_Tree_of_Heaven_%28Ailanthus_altissima%29_on_the_New_Ground_-_geograph.org.uk_-_5743241.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Ailanthus_altissima_%28Mill.%29_Swingle_%28AM_AK301470%29.jpg/1920px-Ailanthus_altissima_%28Mill.%29_Swingle_%28AM_AK301470%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/93/Ailanthus_altissima_%2B_Falcaria_vulgaris_%2B_Melica_transsilvanica_%28subsp._transsilvanica%29_sl1.jpg/1920px-Ailanthus_altissima_%2B_Falcaria_vulgaris_%2B_Melica_transsilvanica_%28subsp._transsilvanica%29_sl1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/Ailanthus_altissima_%2B_Falcaria_vulgaris_%2B_Melica_transsilvanica_%28subsp._transsilvanica%29_sl2.jpg/1920px-Ailanthus_altissima_%2B_Falcaria_vulgaris_%2B_Melica_transsilvanica_%28subsp._transsilvanica%29_sl2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail'],
  'characteristics': [['Form', 'Fast-growing deciduous tree, up to 20 m.'],
                      ['Leaves',
                       'Very large (30–90 cm), with 11–25 leaflets, each with a gland-tipped tooth near the base.'],
                      ['Smell', 'Crushed leaves and stems smell unpleasant.'],
                      ['Fruit', 'Winged seeds in reddish-brown clusters.'],
                      ['Spread', 'Abundant seeds and root suckers.']],
  'removal_steps': [['Pull seedlings', 'Pull young plants with the full root.'],
                    ['Treat adults in place', 'Professionals use stem injection or partial ring-barking in summer.'],
                    ['Fell when dead', 'Remove the tree only once it and its roots are dead.'],
                    ['Monitor suckers', 'Pull any suckers for several years.']],
  'look_alikes': [{'native_plant_id': 'fraxinus-angustifolia',
                   'shared_traits': ['Pinnate leaves', 'Winged seeds', 'Riverbanks'],
                   'differences': ['Leaves opposite on the twig',
                                   'Leaflets toothed all along the edge',
                                   'Dark buds',
                                   'No bad smell']}]},
 {'id': 'oxalis',
  'latin_name': 'Oxalis pes-caprae',
  'common_name': 'Bermuda buttercup',
  'local_name': 'Azedas',
  'family': 'Oxalidaceae',
  'native_range': 'South Africa',
  'flowering': 'November – April',
  'habitat': 'Fields, verges and banks',
  'legal_status': 'Listed invasive in Portugal (Decreto-Lei 92/2019)',
  'caution': 'Digging or tilling without care spreads the bulbils.',
  'display_order': 8,
  'photos': ['https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/Oxalis-pes-caprae-16c-Zachi-Evenor.jpg/1920px-Oxalis-pes-caprae-16c-Zachi-Evenor.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail',
             'https://upload.wikimedia.org/wikipedia/commons/6/65/1_Oxalis_pes-caprae_var_pes-caprae_-_Kenwyn_Nature_Park.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/2017-04-11_Bermuda_buttercup_%28Oxalis_pes-caprae%29%2C_Caminho_do_Aldeia%2C_Vale_de_Santa_Maria_%281%29.JPG/1920px-2017-04-11_Bermuda_buttercup_%28Oxalis_pes-caprae%29%2C_Caminho_do_Aldeia%2C_Vale_de_Santa_Maria_%281%29.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/2025_%C3%81rbore_rebrotando._Santiago_de_Compostela._Galiza.jpg/1920px-2025_%C3%81rbore_rebrotando._Santiago_de_Compostela._Galiza.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/2025-12-14_Coast_of_Ribamar%2C_Lourinh%C3%A3.jpg/1920px-2025-12-14_Coast_of_Ribamar%2C_Lourinh%C3%A3.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail',
             'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/2026-01-04_Ferrel_04.jpg/1920px-2026-01-04_Ferrel_04.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail'],
  'characteristics': [['Form', 'Low herb, up to 30 cm, dying back in summer.'],
                      ['Leaves', 'Clover-like, with three heart-shaped leaflets, often purple-spotted.'],
                      ['Flowers', 'Bright yellow, funnel-shaped, five petals.'],
                      ['Spread', 'Small underground bulbils; seeds are not produced in Portugal.']],
  'removal_steps': [['Dig carefully', 'Lift the whole plant with the soil around the bulb.'],
                    ['Sieve the soil', 'Remove every small bulbil.'],
                    ['Act before summer', 'Remove before the plant dies back and the bulbils are hidden.'],
                    ['Mulch', 'Cover the area to shade out regrowth.']],
  'look_alikes': [{'native_plant_id': 'ficaria-verna',
                   'shared_traits': ['Yellow flowers', 'Winter-spring', 'Low growth'],
                   'differences': ['8–12 glossy petals',
                                   'Single, glossy, heart-shaped leaves',
                                   'No three-part leaves']}]}]


def upgrade() -> None:
    for column in SPECIES_COLUMNS:
        op.add_column("species", sa.Column(column, sa.Text(), nullable=True))
    op.add_column("species", sa.Column("display_order", sa.Integer(), nullable=True))

    op.create_table(
        "species_photos",
        sa.Column("id", sa.Integer(), sa.Identity(), nullable=False),
        sa.Column("species_id", sa.Text(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["species_id"], ["species.id"], name="fk_species_photos_species_id_species", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_species_photos"),
    )
    op.create_index("ix_species_photos_species_id", "species_photos", ["species_id"])

    op.create_table(
        "species_characteristics",
        sa.Column("id", sa.Integer(), sa.Identity(), nullable=False),
        sa.Column("species_id", sa.Text(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("label", sa.Text(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["species_id"], ["species.id"], name="fk_species_characteristics_species_id_species", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_species_characteristics"),
    )
    op.create_index("ix_species_characteristics_species_id", "species_characteristics", ["species_id"])

    op.create_table(
        "removal_steps",
        sa.Column("id", sa.Integer(), sa.Identity(), nullable=False),
        sa.Column("species_id", sa.Text(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["species_id"], ["species.id"], name="fk_removal_steps_species_id_species", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_removal_steps"),
    )
    op.create_index("ix_removal_steps_species_id", "removal_steps", ["species_id"])

    op.create_table(
        "native_plants",
        sa.Column("id", sa.Text(), nullable=False),
        sa.Column("latin_name", sa.Text(), nullable=False),
        sa.Column("common_name", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_native_plants"),
        sa.UniqueConstraint("latin_name", name="uq_native_plants_latin_name"),
    )

    op.create_table(
        "native_plant_photos",
        sa.Column("id", sa.Integer(), sa.Identity(), nullable=False),
        sa.Column("native_plant_id", sa.Text(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["native_plant_id"], ["native_plants.id"], name="fk_native_plant_photos_native_plant_id_native_plants", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_native_plant_photos"),
    )
    op.create_index("ix_native_plant_photos_native_plant_id", "native_plant_photos", ["native_plant_id"])

    op.create_table(
        "look_alikes",
        sa.Column("species_id", sa.Text(), nullable=False),
        sa.Column("native_plant_id", sa.Text(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("shared_traits", postgresql.ARRAY(sa.Text()), nullable=False),
        sa.Column("differences", postgresql.ARRAY(sa.Text()), nullable=False),
        sa.ForeignKeyConstraint(["species_id"], ["species.id"], name="fk_look_alikes_species_id_species", ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["native_plant_id"], ["native_plants.id"], name="fk_look_alikes_native_plant_id_native_plants", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("species_id", "native_plant_id", name="pk_look_alikes"),
    )

    # ── Content ──
    species = sa.table("species", sa.column("id", sa.Text), sa.column("display_order", sa.Integer), *(sa.column(c, sa.Text) for c in SPECIES_COLUMNS))
    native_plants = sa.table("native_plants", sa.column("id", sa.Text), sa.column("latin_name", sa.Text), sa.column("common_name", sa.Text))
    native_plant_photos = sa.table("native_plant_photos", sa.column("native_plant_id", sa.Text), sa.column("position", sa.Integer), sa.column("url", sa.Text))
    species_photos = sa.table("species_photos", sa.column("species_id", sa.Text), sa.column("position", sa.Integer), sa.column("url", sa.Text))
    characteristics = sa.table("species_characteristics", sa.column("species_id", sa.Text), sa.column("position", sa.Integer), sa.column("label", sa.Text), sa.column("text", sa.Text))
    removal_steps = sa.table("removal_steps", sa.column("species_id", sa.Text), sa.column("position", sa.Integer), sa.column("title", sa.Text), sa.column("text", sa.Text))
    look_alikes = sa.table(
        "look_alikes", sa.column("species_id", sa.Text), sa.column("native_plant_id", sa.Text), sa.column("position", sa.Integer),
        sa.column("shared_traits", postgresql.ARRAY(sa.Text())), sa.column("differences", postgresql.ARRAY(sa.Text())),
    )

    op.bulk_insert(native_plants, [{k: n[k] for k in ("id", "latin_name", "common_name")} for n in NATIVE_PLANTS])
    op.bulk_insert(native_plant_photos, [
        {"native_plant_id": n["id"], "position": i, "url": url} for n in NATIVE_PLANTS for i, url in enumerate(n["photos"])
    ])
    for s in SPECIES:
        op.execute(
            species.update().where(species.c.id == s["id"])
            .values(display_order=s["display_order"], **{c: s[c] for c in SPECIES_COLUMNS})
        )
    op.bulk_insert(species_photos, [
        {"species_id": s["id"], "position": i, "url": url} for s in SPECIES for i, url in enumerate(s["photos"])
    ])
    op.bulk_insert(characteristics, [
        {"species_id": s["id"], "position": i, "label": label, "text": text}
        for s in SPECIES for i, (label, text) in enumerate(s["characteristics"])
    ])
    op.bulk_insert(removal_steps, [
        {"species_id": s["id"], "position": i, "title": title, "text": text}
        for s in SPECIES for i, (title, text) in enumerate(s["removal_steps"])
    ])
    op.bulk_insert(look_alikes, [
        {"species_id": s["id"], "position": i, **l} for s in SPECIES for i, l in enumerate(s["look_alikes"])
    ])

    # Every species now has its content, so the new columns can be required.
    for column in [*SPECIES_COLUMNS, "display_order"]:
        op.alter_column("species", column, nullable=False)

    # Same lockdown as the first migration: only the API (table owner) can reach these tables.
    for table in NEW_TABLES:
        op.execute(f"ALTER TABLE public.{table} ENABLE ROW LEVEL SECURITY")
        op.execute(f"REVOKE ALL ON public.{table} FROM anon, authenticated")


def downgrade() -> None:
    for table in reversed(NEW_TABLES):
        op.drop_table(table)
    for column in [*SPECIES_COLUMNS, "display_order"]:
        op.drop_column("species", column)
