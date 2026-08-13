import { render, screen } from '@testing-library/react'; import { ArrowUpRight } from 'lucide-react'; import { MetricCard } from './MetricCard';
import { describe, expect, it } from 'vitest';
describe('MetricCard', () => { it('renders the metric label and value', () => { render(<MetricCard label="SAÍDAS" value={1234} tone="exit" Icon={ArrowUpRight}/>); expect(screen.getByText('SAÍDAS')).not.toBeNull(); expect(screen.getByText('1.234')).not.toBeNull(); }); });
