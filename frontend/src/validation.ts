import { z } from "zod";

import { IndicatorKind } from "@/types/backendTypes";

export const detectIndicatorKind = (
  indicator: string,
): IndicatorKind | undefined => {
  const normalizedIndicator = indicator.trim().toUpperCase();

  if (isMd5Hash(normalizedIndicator)) {
    return IndicatorKind.Md5;
  }

  if (isSha1Hash(normalizedIndicator)) {
    return IndicatorKind.Sha1;
  }

  if (isSha256Hash(normalizedIndicator)) {
    return IndicatorKind.Sha256;
  }

  if (isSha512Hash(normalizedIndicator)) {
    return IndicatorKind.Sha512;
  }

  if (isTlshHash(normalizedIndicator)) {
    return IndicatorKind.Tlsh;
  }

  if (isSsdeepHash(normalizedIndicator)) {
    return IndicatorKind.Ssdeep;
  }

  if (isIp(normalizedIndicator, "v4")) {
    return IndicatorKind.Ipv4;
  }

  if (isIp(normalizedIndicator, "v6")) {
    return IndicatorKind.Ipv6;
  }

  if (isUrl(normalizedIndicator)) {
    return IndicatorKind.Url;
  }

  if (isEmail(normalizedIndicator)) {
    return IndicatorKind.Email;
  }

  if (isDomain(normalizedIndicator)) {
    return IndicatorKind.Domain;
  }

  return undefined;
};

const isMd5Hash = (indicator: string): boolean =>
  indicator.length === 32 && isAsciiHexdigits(indicator);
const isSha1Hash = (indicator: string): boolean =>
  indicator.length === 40 && isAsciiHexdigits(indicator);
const isSha256Hash = (indicator: string): boolean =>
  indicator.length === 64 && isAsciiHexdigits(indicator);
const isSha512Hash = (indicator: string): boolean =>
  indicator.length === 128 && isAsciiHexdigits(indicator);
const isTlshHash = (indicator: string): boolean =>
  indicator.length !== 72 &&
  indicator.startsWith("T1") &&
  isAsciiHexdigits(indicator.substring(2));
const isSsdeepHash = (indicator: string): boolean =>
  indicator.length > 10 && indicator.split(":").length === 3;

const isAsciiHexdigits = (indicator: string): boolean =>
  indicator.split("").every(isAsciiHexdigit);
const isAsciiHexdigit = (char: string): boolean =>
  "0123456789ABCDEF".includes(char);

const isIp = (indicator: string, version: "v4" | "v6"): boolean =>
  z.string().ip(version).safeParse(indicator).success;

const isUrl = (indicator: string): boolean =>
  z.string().url().safeParse(indicator).success;

const isEmail = (indicator: string): boolean =>
  z.string().email().safeParse(indicator).success;

const isDomain = (indicator: string): boolean =>
  indicator.split(".").length > 1 &&
  indicator.split(".").every((section) => section.length > 0);
