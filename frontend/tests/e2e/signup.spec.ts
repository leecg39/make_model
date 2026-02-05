/**
 * @TEST P1-S2-T2 - 회원가입 E2E 테스트
 * @SPEC docs/planning/03-user-flow.md#회원가입
 *
 * E2E Test: 회원가입 전체 흐름 (Playwright)
 *
 * Note: 이 파일은 스켈레톤입니다. 실제 테스트 실행을 위해서는:
 * 1. playwright 패키지 설치: npm install -D @playwright/test
 * 2. playwright.config.ts 생성
 * 3. 백엔드 API 서버 실행 필요 (http://localhost:8000)
 */

import { test, expect } from '@playwright/test';

// 테스트 헬퍼 함수
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Signup E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    /**
     * 테스트 전 초기 상태 설정
     * - 사용자 인증 토큰 제거 (localStorage 초기화)
     * - 가입 페이지로 이동
     */
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/auth/signup`);
  });

  /**
   * @TEST P1-S2-T2.1 - 브랜드 가입 E2E 플로우
   * Scenario: 브랜드 역할 선택 → 정보 입력 → 회원가입 → 대시보드 리다이렉트
   *
   * Given: 가입 페이지 방문
   * When: 브랜드 역할 선택 → Step 2 진행 → 정보 입력 → 제출
   * Then: 대시보드 (/dashboard/brand)로 리다이렉트
   *
   * @note 실제 테스트 실행 시:
   * 1. 백엔드 /api/v1/auth/register 엔드포인트 필요
   * 2. 유효한 이메일/비밀번호 조합 사용
   * 3. 데이터베이스 초기화 또는 테스트 격리 필요
   */
  test.skip('should complete brand signup flow and redirect to dashboard/brand', async ({ page }) => {
    // Step 1: Select brand role
    await page.getByText(/브랜드 \(광고주\)/).click();

    // Verify brand card is highlighted
    const brandButton = page.getByText(/브랜드 \(광고주\)/).locator('..').locator('button');
    await expect(brandButton).toHaveClass(/border-\[#c8ff00\]/);

    // Click next button
    await page.getByRole('button', { name: /다음/ }).click();

    // Wait for Step 2
    await expect(page.getByText(/정보 입력/)).toBeVisible();

    // Step 2: Fill form
    await page.getByLabel(/이메일/).fill('brand@e2e-test.com');
    await page.getByLabel(/^비밀번호$/).fill('BrandPass123!');
    await page.getByLabel(/비밀번호 확인/).fill('BrandPass123!');
    await page.getByLabel(/닉네임/).fill('brand_e2e_test');
    await page.getByLabel(/회사명/).fill('E2E Test Brand Company');

    // Submit form
    await page.getByRole('button', { name: /회원가입/ }).click();

    // Wait for redirect and verify navigation
    await page.waitForURL('**/dashboard/brand', { timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard\/brand/);
  });

  /**
   * @TEST P1-S2-T2.2 - 크리에이터 가입 E2E 플로우
   * Scenario: 크리에이터 역할 선택 → 정보 입력 → 회원가입 → 대시보드 리다이렉트
   *
   * Given: 가입 페이지 방문
   * When: 크리에이터 역할 선택 → Step 2 진행 → 정보 입력 → 제출
   * Then: 대시보드 (/dashboard/creator)로 리다이렉트
   *
   * @note 회사명 필드가 표시되지 않아야 함
   */
  test.skip('should complete creator signup flow and redirect to dashboard/creator', async ({ page }) => {
    // Step 1: Select creator role
    await page.getByText(/크리에이터 \(모델 제작자\)/).click();

    // Verify creator card is highlighted
    const creatorButton = page.getByText(/크리에이터 \(모델 제작자\)/).locator('..').locator('button');
    await expect(creatorButton).toHaveClass(/border-\[#c8ff00\]/);

    // Click next button
    await page.getByRole('button', { name: /다음/ }).click();

    // Wait for Step 2
    await expect(page.getByText(/정보 입력/)).toBeVisible();

    // Verify company name field is NOT visible
    await expect(page.getByLabel(/회사명/)).not.toBeVisible();

    // Step 2: Fill form (without company name)
    await page.getByLabel(/이메일/).fill('creator@e2e-test.com');
    await page.getByLabel(/^비밀번호$/).fill('CreatorPass456!');
    await page.getByLabel(/비밀번호 확인/).fill('CreatorPass456!');
    await page.getByLabel(/닉네임/).fill('creator_e2e_test');

    // Submit form
    await page.getByRole('button', { name: /회원가입/ }).click();

    // Wait for redirect and verify navigation
    await page.waitForURL('**/dashboard/creator', { timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard\/creator/);
  });

  /**
   * @TEST P1-S2-T2.3 - 비밀번호 유효성 검사 E2E
   * Scenario: 7자 비밀번호로 가입 시도
   *
   * Given: Step 2 정보 입력 화면
   * When: 비밀번호 7자 입력 → 제출
   * Then: 비밀번호 에러 메시지 표시, 폼 제출 불가
   */
  test.skip('should show password validation error for 7-character password', async ({ page }) => {
    // Step 1: Select role
    await page.getByText(/브랜드 \(광고주\)/).click();
    await page.getByRole('button', { name: /다음/ }).click();

    // Wait for Step 2
    await expect(page.getByText(/정보 입력/)).toBeVisible();

    // Fill form with 7-char password
    await page.getByLabel(/이메일/).fill('test@e2e-test.com');
    await page.getByLabel(/^비밀번호$/).fill('Short7');
    await page.getByLabel(/비밀번호 확인/).fill('Short7');
    await page.getByLabel(/닉네임/).fill('test_nick');
    await page.getByLabel(/회사명/).fill('Test Company');

    // Try to submit
    await page.getByRole('button', { name: /회원가입/ }).click();

    // Verify error message
    await expect(page.getByText(/비밀번호는 최소 8자 이상이어야 합니다/)).toBeVisible();

    // Verify not redirected
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  /**
   * @TEST P1-S2-T2.4 - 이메일 중복 검사 E2E
   * Scenario: 기존 이메일로 가입 시도
   *
   * Given: 기존 사용자가 이미 가입됨 (test@e2e-existing.com)
   * When: 동일 이메일로 가입 시도 → 제출
   * Then: 이메일 중복 에러 메시지 표시
   *
   * @note 선행 조건: 데이터베이스에 test@e2e-existing.com 사용자 존재
   */
  test.skip('should show error when email already exists', async ({ page }) => {
    // Step 1: Select role
    await page.getByText(/크리에이터 \(모델 제작자\)/).click();
    await page.getByRole('button', { name: /다음/ }).click();

    // Wait for Step 2
    await expect(page.getByText(/정보 입력/)).toBeVisible();

    // Fill form with existing email
    await page.getByLabel(/이메일/).fill('test@e2e-existing.com');
    await page.getByLabel(/^비밀번호$/).fill('ValidPass123!');
    await page.getByLabel(/비밀번호 확인/).fill('ValidPass123!');
    await page.getByLabel(/닉네임/).fill('creator_test');

    // Try to submit
    await page.getByRole('button', { name: /회원가입/ }).click();

    // Verify error message (either from validation or API)
    const errorLocator = page.getByText(/이미 존재|중복|already exists/i);
    await expect(errorLocator).toBeVisible({ timeout: 5000 });

    // Verify not redirected
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  /**
   * @TEST P1-S2-T2.5 - 역할 미선택 검증
   * Scenario: 역할 선택 없이 다음 버튼 클릭
   *
   * Given: Step 1 역할 선택 화면
   * When: 역할 선택 없이 다음 버튼 클릭
   * Then: 에러 메시지 표시, Step 2 진입 불가
   */
  test.skip('should show error when proceeding without selecting role', async ({ page }) => {
    // Try to click next without selecting role
    await page.getByRole('button', { name: /다음/ }).click();

    // Verify error message
    await expect(page.getByText(/역할을 선택해주세요/)).toBeVisible();

    // Verify still on Step 1
    await expect(page.getByText(/역할을 선택해주세요/)).toBeVisible();
    await expect(page.getByText(/정보 입력/)).not.toBeVisible();
  });

  /**
   * @TEST P1-S2-T2.6 - 회사명 필수 입력 검증 (브랜드 역할)
   * Scenario: 브랜드 역할에서 회사명 미입력
   *
   * Given: Step 2 정보 입력 화면 (브랜드 역할)
   * When: 회사명 미입력 → 제출
   * Then: 회사명 필수 에러 메시지 표시
   */
  test.skip('should show error when company name is missing for brand role', async ({ page }) => {
    // Step 1: Select brand
    await page.getByText(/브랜드 \(광고주\)/).click();
    await page.getByRole('button', { name: /다음/ }).click();

    // Wait for Step 2
    await expect(page.getByText(/정보 입력/)).toBeVisible();

    // Fill form WITHOUT company name
    await page.getByLabel(/이메일/).fill('brand@e2e-test.com');
    await page.getByLabel(/^비밀번호$/).fill('ValidPass123!');
    await page.getByLabel(/비밀번호 확인/).fill('ValidPass123!');
    await page.getByLabel(/닉네임/).fill('brand_nick');

    // Try to submit without company name
    await page.getByRole('button', { name: /회원가입/ }).click();

    // Verify company name error message
    await expect(page.getByText(/회사명을 입력해주세요/)).toBeVisible();
  });

  /**
   * @TEST P1-S2-T2.7 - 비밀번호 불일치 검증
   * Scenario: 비밀번호와 비밀번호 확인이 다를 때
   *
   * Given: Step 2 정보 입력 화면
   * When: 비밀번호 != 비밀번호 확인 → 제출
   * Then: 불일치 에러 메시지 표시
   */
  test.skip('should show error when passwords do not match', async ({ page }) => {
    // Step 1: Select role
    await page.getByText(/크리에이터 \(모델 제작자\)/).click();
    await page.getByRole('button', { name: /다음/ }).click();

    // Wait for Step 2
    await expect(page.getByText(/정보 입력/)).toBeVisible();

    // Fill form with mismatched passwords
    await page.getByLabel(/이메일/).fill('creator@e2e-test.com');
    await page.getByLabel(/^비밀번호$/).fill('ValidPass123!');
    await page.getByLabel(/비밀번호 확인/).fill('DifferentPass456!');
    await page.getByLabel(/닉네임/).fill('creator_nick');

    // Try to submit
    await page.getByRole('button', { name: /회원가입/ }).click();

    // Verify mismatch error message
    await expect(page.getByText(/비밀번호가 일치하지 않습니다/)).toBeVisible();
  });

  /**
   * @TEST P1-S2-T2.8 - 닉네임 유효성 검사 (1자)
   * Scenario: 닉네임이 1자일 때
   *
   * Given: Step 2 정보 입력 화면
   * When: 닉네임 1자 입력 → 제출
   * Then: 닉네임 길이 에러 메시지 표시
   */
  test.skip('should show error when nickname is 1 character', async ({ page }) => {
    // Step 1: Select role
    await page.getByText(/브랜드 \(광고주\)/).click();
    await page.getByRole('button', { name: /다음/ }).click();

    // Wait for Step 2
    await expect(page.getByText(/정보 입력/)).toBeVisible();

    // Fill form with 1-char nickname
    await page.getByLabel(/이메일/).fill('test@e2e-test.com');
    await page.getByLabel(/^비밀번호$/).fill('ValidPass123!');
    await page.getByLabel(/비밀번호 확인/).fill('ValidPass123!');
    await page.getByLabel(/닉네임/).fill('x');
    await page.getByLabel(/회사명/).fill('Test Company');

    // Try to submit
    await page.getByRole('button', { name: /회원가입/ }).click();

    // Verify nickname error message
    await expect(page.getByText(/닉네임은 2-20자 사이여야 합니다/)).toBeVisible();
  });

  /**
   * @TEST P1-S2-T2.9 - Step 1에서 Step 2로 이동
   * Scenario: 역할 선택 후 다음 버튼으로 Step 2 진입
   *
   * Given: 가입 페이지의 Step 1
   * When: 브랜드 역할 선택 → 다음 버튼 클릭
   * Then: Step 2 정보 입력 화면 표시
   */
  test.skip('should navigate to Step 2 after selecting role', async ({ page }) => {
    // Select brand role
    await page.getByText(/브랜드 \(광고주\)/).click();

    // Verify Step 1 progress indicator shows brand selected
    const brandButton = page.getByText(/브랜드 \(광고주\)/).locator('..').locator('button');
    await expect(brandButton).toHaveClass(/border-\[#c8ff00\]/);

    // Click next
    await page.getByRole('button', { name: /다음/ }).click();

    // Verify Step 2 is displayed
    await expect(page.getByText(/정보 입력/)).toBeVisible();
    await expect(page.getByLabelText(/이메일/)).toBeVisible();
    await expect(page.getByLabelText(/^비밀번호$/)).toBeVisible();
  });

  /**
   * @TEST P1-S2-T2.10 - Step 2에서 Step 1로 돌아가기
   * Scenario: Step 2에서 이전 버튼 클릭
   *
   * Given: Step 2 정보 입력 화면
   * When: 이전 버튼 클릭
   * Then: Step 1 역할 선택 화면으로 돌아감
   */
  test.skip('should navigate back to Step 1 from Step 2', async ({ page }) => {
    // Select role and proceed to Step 2
    await page.getByText(/브랜드 \(광고주\)/).click();
    await page.getByRole('button', { name: /다음/ }).click();

    // Wait for Step 2
    await expect(page.getByText(/정보 입력/)).toBeVisible();

    // Click back button
    await page.getByRole('button', { name: /이전/ }).click();

    // Verify back to Step 1
    await expect(page.getByText(/역할을 선택해주세요/)).toBeVisible();
    await expect(page.getByText(/정보 입력/)).not.toBeVisible();
  });
});
