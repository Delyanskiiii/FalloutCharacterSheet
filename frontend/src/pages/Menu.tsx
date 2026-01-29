const Menu = ({characters, loadSheet}: {characters: string[], loadSheet: (name: string) => void}) => {
  return (
    <div>
        <h1>Select Your Character</h1>
        {characters.map(name => (
        <button key={name} onClick={() => loadSheet(name)}>
            {name}
        </button>
        ))}
    </div>
  );
}
export default Menu;