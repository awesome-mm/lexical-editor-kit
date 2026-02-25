/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { JSX } from "react";

import type { ChangeHandler, LinkMatcher } from "@lexical/link";
import {
  AutoLinkPlugin as LexicalAutoLinkPluginBase,
  createLinkMatcherWithRegExp,
} from "@lexical/react/LexicalAutoLinkPlugin";
import * as React from "react";

// 기본 패턴/매처 — 외부에서 재사용·확장 가능
export const URL_REGEX =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(?<![-.+():%])/;

export const EMAIL_REGEX =
  /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

export const DEFAULT_URL_MATCHER = createLinkMatcherWithRegExp(URL_REGEX, (text) =>
  text.startsWith("http") ? text : `https://${text}`,
);

export const DEFAULT_EMAIL_MATCHER = createLinkMatcherWithRegExp(
  EMAIL_REGEX,
  (text) => `mailto:${text}`,
);

export const DEFAULT_MATCHERS: LinkMatcher[] = [DEFAULT_URL_MATCHER, DEFAULT_EMAIL_MATCHER];

export interface AutoLinkPluginProps {
  /** 링크 매처 목록. 미지정 시 URL + 이메일 기본 매처 사용 */
  matchers?: LinkMatcher[];
  /** 링크 생성/변경 시 호출되는 콜백 */
  onChange?: ChangeHandler;
}

/**
 * 확장 가능한 AutoLink 플러그인.
 * - matchers: 커스텀 매처만 쓰거나, DEFAULT_MATCHERS와 합쳐서 사용 가능
 * - onChange: 링크 변경 시 로깅/분석 등에 활용
 *
 * @example
 * // 기본 사용 (URL + 이메일)
 * <AutoLinkPlugin />
 *
 * @example
 * // 커스텀 매처만 사용
 * <AutoLinkPlugin matchers={[myCustomMatcher]} />
 *
 * @example
 * // 기본 + 추가 매처
 * <AutoLinkPlugin matchers={[...DEFAULT_MATCHERS, myCustomMatcher]} />
 *
 * @example
 * // 링크 변경 감지
 * <AutoLinkPlugin onChange={(url, prevUrl) => console.log(url, prevUrl)} />
 */
export default function AutoLinkPlugin(props: AutoLinkPluginProps): JSX.Element {
  const { matchers = DEFAULT_MATCHERS, onChange } = props;
  return <LexicalAutoLinkPluginBase matchers={matchers} onChange={onChange} />;
}

// re-export for consumers
export { createLinkMatcherWithRegExp };
export type { ChangeHandler, LinkMatcher };
