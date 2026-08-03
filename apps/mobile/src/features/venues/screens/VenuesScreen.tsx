import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import type { Venue } from '../../../core/types/ranking.types';
import { useTinballStore } from '../../../core/store/useTinballStore';
import { BodyText, ScreenTitle } from '../../../shared/components/DetailPrimitives';
import { FootballRating } from '../../../shared/components/FootballRating';
import { StatusPill } from '../../../shared/components/StatusPill';
import { EmptyState } from '../../../shared/components/ScreenState';
import { Card, Filter, Filters, FilterText, Header, List, Meta, Name, Price, Screen } from './VenuesScreenStyled';
const formats = [undefined, 'F5', 'F7', 'F8', 'F11'] as const;
export function VenuesScreen() {
  const venues = useTinballStore((state) => state.venues);
  const locality = useTinballStore((state) => state.currentProfile?.locality);
  const [format, setFormat] = useState<(typeof formats)[number]>();
  const [sponsoredOnly, setSponsoredOnly] = useState(false);
  const visible = useMemo(() => venues.filter((venue) => (!locality || venue.locality.toLocaleLowerCase() === locality.toLocaleLowerCase()) && (!format || venue.formats.includes(format)) && (!sponsoredOnly || venue.sponsored)), [format, locality, sponsoredOnly, venues]);
  const cycleFormat = () => setFormat((current) => formats[(formats.indexOf(current) + 1) % formats.length]);
  const render = useCallback(({ item }: { item: Venue }) => <Card accessibilityRole="button" onPress={() => Alert.alert(item.name, 'La reserva desde Tinball se habilitará cuando la cancha integre su disponibilidad.')}>{item.sponsored ? <StatusPill label="Patrocinado" tone="info" /> : null}<Name>{item.name}</Name><Meta>{item.address} · {item.locality}</Meta><FootballRating value={item.rating} count={item.reviewCount} /><Meta>{item.formats.join(' · ')} · {item.surface}</Meta><Price>{item.priceLabel}</Price></Card>, []);
  return <Screen><List data={visible} keyExtractor={(item) => item.id} renderItem={render} ListEmptyComponent={<EmptyState title="No encontramos canchas" message="Quitá un filtro o volvé cuando se sumen nuevos complejos." />} ListHeaderComponent={<Header><ScreenTitle>Canchas</ScreenTitle><BodyText>Encontrá lugares por formato, superficie y zona. Los anuncios pagos están identificados.</BodyText><Filters><Filter><FilterText>{locality ?? 'Mi localidad'}</FilterText></Filter><Filter accessibilityRole="button" onPress={cycleFormat}><FilterText>{format ?? 'Todos los formatos'}</FilterText></Filter><Filter accessibilityRole="button" onPress={() => setSponsoredOnly((current) => !current)}><FilterText>{sponsoredOnly ? 'Sólo patrocinadas' : 'Todas las canchas'}</FilterText></Filter></Filters></Header>} /></Screen>;
}
