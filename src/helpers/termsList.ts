import * as dayjs from "dayjs";
import duration, { DurationUnitType } from "dayjs/plugin/duration";
import { arbitrum, base, goerli, mainnet, polygon, sepolia } from "viem/chains";
import { DropdownOption } from "../components/Dropdown/Dropdown";

dayjs.extend(duration);

export const aprList = (apr: number) => {
  const ceilAPR = Math.ceil(apr);
  return [
    (Math.floor(ceilAPR / 5) - (ceilAPR % 5 === 0 ? 1 : 0)) * 5,
    apr,
    (Math.floor(ceilAPR / 5) + 1) * 5,
    (Math.floor(ceilAPR / 5) + 2) * 5,
  ].map((value) => ({ label: value.toString(), value: value.toString() }));
};

export const durationList = (baseDuration: number, cycleDuration: number) => {
  return [cycleDuration, cycleDuration * 2, cycleDuration * 3].map((value) => ({
    label: value.toString(),
    value: value.toString(),
  }));
};

const chainToPoolDuration: Record<
  number,
  Array<{ poolId: number; time: number; unit: DurationUnitType }>
> = {
  [polygon.id]: [
    { poolId: 43, time: 12, unit: "hours" },
    { poolId: 42, time: 1, unit: "day" },
    { poolId: 33, time: 7, unit: "days" },
    { poolId: 40, time: 30, unit: "days" },
    { poolId: 41, time: 120, unit: "days" },
  ],
  [mainnet.id]: [
    { poolId: 18, time: 12, unit: "hours" },
    { poolId: 17, time: 1, unit: "day" },
    { poolId: 20, time: 3, unit: "days" },
    { poolId: 15, time: 7, unit: "days" },
    { poolId: 9, time: 30, unit: "days" },
    { poolId: 19, time: 60, unit: "days" },
    { poolId: 16, time: 120, unit: "days" },
    { poolId: 21, time: 30, unit: "days" },
    { poolId: 23, time: 60, unit: "days" },
    { poolId: 22, time: 120, unit: "days" },
  ],
  [goerli.id]: [{ poolId: 1, time: 12, unit: "hours" }],
  [sepolia.id]: [{ poolId: 1, time: 12, unit: "hours" }],
  [arbitrum.id]: [
    { poolId: 5, time: 12, unit: "hours" },
    { poolId: 4, time: 1, unit: "day" },
    { poolId: 6, time: 3, unit: "days" },
    { poolId: 2, time: 7, unit: "days" },
    { poolId: 1, time: 30, unit: "days" },
    { poolId: 3, time: 120, unit: "days" },
  ],
  [base.id]: [
    { poolId: 5, time: 12, unit: "hours" },
    { poolId: 4, time: 1, unit: "day" },
    { poolId: 7, time: 3, unit: "days" },
    { poolId: 1, time: 7, unit: "days" },
    { poolId: 2, time: 30, unit: "days" },
    { poolId: 6, time: 60, unit: "days" },
    { poolId: 3, time: 120, unit: "days" },
  ],
};

const mapDefaultExpiration: Record<string, string> = {
  [polygon.id]: "40",
  [mainnet.id]: "9",
  [goerli.id]: "1",
  [arbitrum.id]: "1",
  [base.id]: "2",
};

const mapChainToDropdownOptions = Object.entries(chainToPoolDuration).reduce<
  Record<string, DropdownOption<string>[]>
>(
  (chain, [chainId, chainDurations]) => ({
    ...chain,
    [chainId]: chainDurations.map(({ poolId, time, unit }) => ({
      label: `${time} ${unit}`,
      value: poolId.toString(),
    })),
  }),
  {}
);

const mapPoolToDuration = Object.entries(chainToPoolDuration).reduce<
  Record<string, Record<string, string>>
>(
  (chain, [chainId, chainDurations]) => ({
    ...chain,
    [chainId]: chainDurations.reduce<Record<string, string>>(
      (obj, { poolId, time, unit }) => {
        const seconds = dayjs.duration(time, unit).asSeconds();
        return {
          ...obj,
          [poolId]: seconds,
        };
      },
      {}
    ),
  }),
  {}
);

const mapDurationToPool = Object.entries(chainToPoolDuration).reduce<
  Record<string, Record<string, string>>
>(
  (chain, [chainId, chainDurations]) => ({
    ...chain,
    [chainId]: chainDurations.reduce<Record<string, string>>(
      (obj, { poolId, time, unit }) => {
        const seconds = dayjs.duration(time, unit).asSeconds();
        return {
          ...obj,
          [seconds]: poolId,
        };
      },
      {}
    ),
  }),
  {}
);

export interface ChainTerms {
  dropdownOptions: DropdownOption<string>[];
  poolToDuration: Record<string, string>;
  durationToPool: Record<string, string>;
  defaultExpiration: string;
}

export const chainToTerms: Record<number, ChainTerms> = {
  [polygon.id]: {
    dropdownOptions: mapChainToDropdownOptions[polygon.id],
    poolToDuration: mapPoolToDuration[polygon.id],
    durationToPool: mapDurationToPool[polygon.id],
    defaultExpiration: mapDefaultExpiration[polygon.id],
  },
  [mainnet.id]: {
    dropdownOptions: mapChainToDropdownOptions[mainnet.id],
    poolToDuration: mapPoolToDuration[mainnet.id],
    durationToPool: mapDurationToPool[mainnet.id],
    defaultExpiration: mapDefaultExpiration[mainnet.id],
  },
  [goerli.id]: {
    dropdownOptions: mapChainToDropdownOptions[goerli.id],
    poolToDuration: mapPoolToDuration[goerli.id],
    durationToPool: mapDurationToPool[goerli.id],
    defaultExpiration: mapDefaultExpiration[goerli.id],
  },
  [sepolia.id]: {
    dropdownOptions: mapChainToDropdownOptions[sepolia.id],
    poolToDuration: mapPoolToDuration[sepolia.id],
    durationToPool: mapDurationToPool[sepolia.id],
    defaultExpiration: mapDefaultExpiration[sepolia.id],
  },
  [arbitrum.id]: {
    dropdownOptions: mapChainToDropdownOptions[arbitrum.id],
    poolToDuration: mapPoolToDuration[arbitrum.id],
    durationToPool: mapDurationToPool[arbitrum.id],
    defaultExpiration: mapDefaultExpiration[arbitrum.id],
  },
  [base.id]: {
    dropdownOptions: mapChainToDropdownOptions[base.id],
    poolToDuration: mapPoolToDuration[base.id],
    durationToPool: mapDurationToPool[base.id],
    defaultExpiration: mapDefaultExpiration[base.id],
  },
};
