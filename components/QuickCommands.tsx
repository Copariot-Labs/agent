import { Button } from "@/components/ui/button"

interface QuickCommandsProps {
  onSelect: (command: string) => void
}

export default function QuickCommands({ onSelect }: QuickCommandsProps) {
  const commands = [
    'How to mint', 
    'How to redeem', 
    'Check PIPI balance',
    'Check all balances'
  ]

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-2">
      {commands.map((command) => (
        <Button
          key={command}
          onClick={() => onSelect(command)}
          variant="outline"
          className="text-xs bg-white hover:bg-pink-100 text-purple-700 border-purple-300 rounded-full px-4 py-2 transition-all duration-200 ease-in-out transform hover:scale-105"
        >
          {command}
        </Button>
      ))}
    </div>
  )
}

