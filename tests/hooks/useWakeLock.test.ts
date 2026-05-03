import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWakeLock } from '../../src/hooks/useWakeLock';

describe('useWakeLock', () => {
  let mockRelease: ReturnType<typeof vi.fn>;
  let mockRequest: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRelease = vi.fn().mockResolvedValue(undefined);
    mockRequest = vi.fn().mockResolvedValue({ release: mockRelease });
    Object.defineProperty(navigator, 'wakeLock', {
      value: { request: mockRequest },
      writable: true,
      configurable: true,
    });
  });

  it('returns request and release functions', () => {
    const { result } = renderHook(() => useWakeLock());
    expect(typeof result.current.request).toBe('function');
    expect(typeof result.current.release).toBe('function');
  });

  it('calls navigator.wakeLock.request when request is called', async () => {
    const { result } = renderHook(() => useWakeLock());
    await act(async () => {
      await result.current.request();
    });
    expect(mockRequest).toHaveBeenCalledWith('screen');
  });

  it('releases previous lock when requesting again', async () => {
    const { result } = renderHook(() => useWakeLock());
    await act(async () => {
      await result.current.request();
    });
    await act(async () => {
      await result.current.request();
    });
    expect(mockRelease).toHaveBeenCalled();
  });

  it('handles missing wakeLock API gracefully', () => {
    Object.defineProperty(navigator, 'wakeLock', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useWakeLock());
    expect(async () => {
      await act(async () => {
        await result.current.request();
      });
    }).not.toThrow();
  });

  it('handles request rejection gracefully', async () => {
    mockRequest.mockRejectedValue(new Error('Not allowed'));
    const { result } = renderHook(() => useWakeLock());
    await act(async () => {
      await result.current.request();
    });
    // No throw expected
  });

  it('releases on unmount', async () => {
    const { result, unmount } = renderHook(() => useWakeLock());
    await act(async () => {
      await result.current.request();
    });
    unmount();
    expect(mockRelease).toHaveBeenCalled();
  });
});
