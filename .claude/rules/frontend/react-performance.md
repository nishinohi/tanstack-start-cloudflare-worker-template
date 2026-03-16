---
paths: apps/web/src/**/*.{tsx}
---

## Basic Rules for Optimization

When defining functions inside React components, decide whether to use useCallback based on the following priorities and principles. Avoiding premature optimization and maintaining code readability should be the top priority.

### Default: Don't Use useCallback

- Most re-renders are fast enough
- Function recreation itself is rarely a performance bottleneck

### Consider Moving

- If a function doesn't depend on props or state (non-reactive), move it outside the component instead of wrapping it with useCallback to prevent recreation on every render

### Conditions to Consider Using useCallback

Consider using useCallback only when one of the following applies:

- When passing the function to a child component wrapped with React.memo, and you need to prevent unnecessary re-renders caused by reference mismatches
- When the function is included in the dependency array of other hooks (useEffect or useMemo), and an unstable reference would cause infinite loops or unnecessary re-synchronization of side effects

### Prioritize Alternative Approaches

- If you're reading state only to update that state, use an updater function (e.g., setCount(c => c + 1)) to eliminate the dependency
- If you want to read the latest value inside an effect but don't want it to re-run, use useEffectEvent

## Implementation Examples

Prioritize patterns that avoid useCallback and keep code concise.

```typescript
// ❌ Bad: Wrapping a function with useCallback when there are no dependencies (pointless cost)
function MyComponent() {
  const handleLog = useCallback(() => {
    console.log('Clicked');
  }, []);
  // ...
}

// ✅ Good 1: Moving outside the component (cleanest approach)
const handleLog = () => console.log('Static function');
function MyComponent() {
  return <button onClick={handleLog}>Click</button>;
}

// ✅ Good 2: Eliminating dependencies with updater function (no useCallback needed)
function Counter() {
  const [count, setCount] = useState(0);
  
  // No need to include count as a dependency in useCallback
  const increment = () => setCount(c => c + 1);
  
  return <button onClick={increment}>+</button>;
}

// ✅ Necessary: Passing to a memoized child component
const ExpensiveList = memo(({ onItemClick }) => { /*...*/ });

function Parent() {
  const [items, setItems] = useState([]);
  
  // Worth stabilizing the reference since the child is memoized
  const handleItemClick = useCallback((id) => {
    console.log('Item clicked:', id);
  }, []);

  return <ExpensiveList onItemClick={handleItemClick} />;
}
```
