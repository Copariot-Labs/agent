import { Button } from "@/components/ui/button"

interface QuickCommandsProps {
  onSelect: (command: string) => void
}

export default function QuickCommands({ onSelect }: QuickCommandsProps) {
  const commands = [
    'How to mint',
    'How to redeem',
    'Check all balances',
    'Faucet'
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {commands.map((command) => (
        <Button
          key={command}
          onClick={() => onSelect(command)}
          variant="outline"
          className="text-xs border border-[#E7EAF0] bg-white text-black rounded-full px-4 py-2 transition-all duration-200 ease-in-out transform
            hover:bg-white  hover:scale-105
          "
        >
          {command}
        </Button>
      ))}
    </div>
  )
}
