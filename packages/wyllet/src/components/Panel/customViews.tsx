import { useState } from 'react'
import { erc20Abi, getAddress, isAddress } from 'viem'
import { useConnection, useReadContracts } from 'wagmi'
import { useWylletContext } from '../../core/context'
import { useWylletTokens, useWylletToast } from '../../hooks'
import { format } from '../../i18n/en'
import { cx, formatAmount } from '../../utils'
import { AlertIcon, Spinner } from '../primitives/Icons'
import { TokenIcon } from '../TokenIcon'
import { PrimaryButton } from './shared'

/* ------------------------------------------------------------------ Import token */

export function ImportTokenView({ onDone }: { onDone(): void }) {
  const { t } = useWylletContext()
  const toast = useWylletToast()
  const { address: account, chain, chainId } = useConnection()
  const { tokens, importToken } = useWylletTokens()
  const [value, setValue] = useState('')
  const raw = value.trim()
  const address = isAddress(raw, { strict: false }) ? getAddress(raw) : undefined
  const network = chain?.name ?? ''

  const { data, isLoading } = useReadContracts({
    allowFailure: true,
    contracts: address
      ? ([
          { address, abi: erc20Abi, functionName: 'name' },
          { address, abi: erc20Abi, functionName: 'symbol' },
          { address, abi: erc20Abi, functionName: 'decimals' },
          { address, abi: erc20Abi, functionName: 'balanceOf', args: [account!] },
        ] as const)
      : [],
    query: { enabled: !!address && !!account },
  })

  const [name, symbol, decimals, balance] = data ?? []
  const token =
    address && symbol?.status === 'success' && decimals?.status === 'success'
      ? { address, symbol: symbol.result as string, decimals: Number(decimals.result), name: name?.status === 'success' ? (name.result as string) : undefined }
      : undefined
  const exists = !!address && tokens.some((x) => x.address.toLowerCase() === address.toLowerCase())

  let status: { tone: 'muted' | 'error'; text: string } | null = null
  if (raw && !address) status = { tone: 'error', text: t.invalidAddress }
  else if (address && isLoading) status = { tone: 'muted', text: format(t.lookingUpToken, { network }) }
  else if (address && !isLoading && data && !token) status = { tone: 'error', text: format(t.notAToken, { network }) }
  else if (token && exists) status = { tone: 'error', text: format(t.tokenExists, { symbol: token.symbol }) }

  const submit = () => {
    if (!token || exists) return
    importToken(token)
    toast.success(format(t.tokenImported, { symbol: token.symbol }), { description: network })
    onDone()
  }

  return (
    <form className="wy-form wy-enter" onSubmit={(e) => (e.preventDefault(), submit())}>
      <label className="wy-field">
        <span>{t.tokenAddress}</span>
        <input
          data-autofocus
          className="wy-input wy-mono"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0x…"
          spellCheck={false}
          autoComplete="off"
        />
      </label>

      {status && (
        <p className={cx('wy-field-status', status.tone === 'error' && 'wy-field-error')}>
          {status.tone === 'error' ? <AlertIcon size={14} /> : <Spinner size={14} />}
          {status.text}
        </p>
      )}

      {token && (
        <div className="wy-token-preview wy-enter">
          <TokenIcon symbol={token.symbol} chainId={chainId} size={40} />
          <div className="wy-row-main">
            <span className="wy-row-title">{token.symbol}</span>
            <span className="wy-row-sub">
              {token.name ?? token.symbol} · {token.decimals} decimals
            </span>
          </div>
          {balance?.status === 'success' && <span className="wy-amount">{formatAmount(balance.result as bigint, token.decimals)}</span>}
        </div>
      )}

      <PrimaryButton type="submit" disabled={!token || exists}>
        {token ? format(t.importAction, { symbol: token.symbol }) : t.importToken}
      </PrimaryButton>
    </form>
  )
}
